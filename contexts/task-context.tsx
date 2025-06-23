"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task, TaskContextType, DueCategory, SubTask } from "@/lib/types"
import { getTodayDateString, getDueCategory } from "@/lib/date-utils"
import { TaskStorage } from "@/lib/storage"
import { format } from "date-fns"

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskForFunctions, setTaskForFunctions] = useState<Task | null>(null)
  const [taskForDetails, setTaskForDetails] = useState<Task | null>(null)
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null)
  const [effectiveDate, setEffectiveDate] = useState<string>(getTodayDateString())
  const [isLoading, setIsLoading] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      console.log("[TaskContext] Initial Notification.permission from browser:", Notification.permission)
      setNotificationPermission(Notification.permission)
    } else {
      console.log("[TaskContext] Notifications not supported or window not defined.")
    }
  }, [])

  useEffect(() => {
    try {
      TaskStorage.migrateOldData()
      const storedTasks = TaskStorage.getTasks()
      setTasks(storedTasks)
      console.log("[TaskContext] Tasks loaded from storage:", storedTasks.length)
    } catch (error) {
      console.error("[TaskContext] Failed to load tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      TaskStorage.setTasks(tasks)
    }
  }, [tasks, isLoading])

  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getTodayDateString()
      if (newToday !== effectiveDate) {
        console.log(`[TaskContext] Date changed from ${effectiveDate} to ${newToday}`)
        setEffectiveDate(newToday)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [effectiveDate])

  const requestNotificationPermission = useCallback(async () => {
    console.log("[TaskContext] requestNotificationPermission called.")
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support desktop notifications.")
      console.log("[TaskContext] Notifications not supported by this browser.")
      return "denied" as NotificationPermission
    }
    const currentPermission = Notification.permission
    console.log("[TaskContext] Current Notification.permission before request:", currentPermission)

    if (currentPermission === "granted") {
      setNotificationPermission("granted")
      console.log("[TaskContext] Permission already granted.")
      return "granted" as NotificationPermission
    }
    if (currentPermission === "denied") {
      alert(
        "Notification permission was previously denied. Please enable it in your browser settings if you want alarms.",
      )
      setNotificationPermission("denied")
      console.log("[TaskContext] Permission previously denied by user.")
      return "denied" as NotificationPermission
    }

    // Only request if 'default'
    const permission = await Notification.requestPermission()
    console.log("[TaskContext] Notification.requestPermission() result:", permission)
    setNotificationPermission(permission)
    if (permission === "denied") {
      alert("Notifications permission denied. You won't receive alarm alerts.")
    } else if (permission === "granted") {
      console.log("[TaskContext] Notification permission granted by user.")
    }
    return permission
  }, [])

  useEffect(() => {
    console.log(
      `[TaskContext Effect: Alarm Check] Initializing. Permission: ${notificationPermission}, isLoading: ${isLoading}`,
    )

    if (notificationPermission !== "granted" || isLoading) {
      console.log(
        `[TaskContext Effect: Alarm Check] Conditions not met (Permission: ${notificationPermission}, isLoading: ${isLoading}). Returning.`,
      )
      return
    }

    console.log("[TaskContext Effect: Alarm Check] Setting up alarm check interval (20s).")
    const alarmCheckInterval = setInterval(() => {
      const now = new Date()
      const currentDateStr = format(now, "yyyy-MM-dd")
      const currentTimeStr = format(now, "HH:mm")
      console.log(
        `--- Alarm Check Tick (${new Date().toLocaleTimeString()}) --- EffectiveDate: ${currentDateStr}, CurrentTime: ${currentTimeStr}`,
      )

      if (!tasks || tasks.length === 0) {
        // console.log("No tasks to check for alarms.")
        return
      }

      tasks.forEach((task) => {
        if (
          task.alarmTime &&
          !task.completed &&
          task.targetDate === currentDateStr &&
          task.alarmTime === currentTimeStr
        ) {
          console.log(
            `%cMATCH FOUND for task: "${task.text}" (Target: ${task.targetDate} ${task.alarmTime})`,
            "color: green; font-weight: bold;",
          )
          const alarmFiredKey = `alarm_fired_${task.id}_${task.targetDate}_${task.alarmTime}`

          if (sessionStorage.getItem(alarmFiredKey)) {
            console.log(`Alarm for "${task.text}" (key: ${alarmFiredKey}) already fired this session. Skipping.`)
            return
          }

          console.log(`Attempting to show notification for: "${task.text}"`)
          try {
            const notification = new Notification(`Today App: ${task.text}`, {
              body: `It's time for your task!`,
              icon: "/placeholder-logo.png",
              vibrate: [200, 100, 200],
              tag: task.id, // Using task ID as tag helps replace old notification if logic fires fast
            })

            notification.onshow = () => {
              console.log(`Notification SHOWN for "${task.text}"`)
            }
            notification.onclick = () => {
              console.log(`Notification CLICKED for "${task.text}"`)
              window.focus()
            }
            notification.onerror = (event) => {
              console.error(`Notification ERROR for "${task.text}":`, event)
            }
            notification.onclose = () => {
              console.log(`Notification CLOSED for "${task.text}"`)
            }

            console.log(`Notification object created for "${task.text}". Waiting for onshow/onerror...`)

            sessionStorage.setItem(alarmFiredKey, "true")
            console.log(`Marked alarm as fired in session storage for "${task.text}" (Key: ${alarmFiredKey})`)
            setTimeout(() => {
              sessionStorage.removeItem(alarmFiredKey)
              // console.log(`Cleared session storage key ${alarmFiredKey} after timeout.`);
            }, 65 * 1000) // Clear after 65 seconds
          } catch (e) {
            console.error(`Error creating notification for "${task.text}":`, e)
          }
        }
      })
    }, 20 * 1000)

    return () => {
      console.log("[TaskContext Effect: Alarm Check] Clearing alarm check interval.")
      clearInterval(alarmCheckInterval)
    }
  }, [tasks, notificationPermission, isLoading]) // Removed effectiveDate as it's not directly used in this effect's logic that depends on it.

  const addTask = useCallback((text: string, targetDate: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      targetDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks((prevTasks) => [...prevTasks, newTask])
  }, [])

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }, [])

  const updateTaskTargetDate = useCallback((id: string, newTargetDate: string) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, targetDate: newTargetDate } : task)))
    setTaskForFunctions(null)
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
    setTaskToDeleteId(null)
  }, [])

  const updateTaskDetails = useCallback(
    (id: string, details: { notes?: string; subTasks?: SubTask[]; alarmTime?: string | null }) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                notes: details.notes !== undefined ? details.notes : task.notes,
                subTasks: details.subTasks !== undefined ? details.subTasks : task.subTasks,
                alarmTime: details.alarmTime !== undefined ? details.alarmTime : task.alarmTime,
              }
            : task,
        ),
      )
    },
    [],
  )

  const getTasksForCategory = useCallback(
    (category: DueCategory): Task[] => {
      return tasks
        .filter((task) => {
          const taskCategory = getDueCategory(task.targetDate, effectiveDate)
          return category === "today" ? taskCategory === "today" : taskCategory === category
        })
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    },
    [tasks, effectiveDate],
  )

  const openTaskFunctionsModal = useCallback((task: Task) => setTaskForFunctions(task), [])
  const closeTaskFunctionsModal = useCallback(() => setTaskForFunctions(null), [])
  const openDetailsModal = useCallback((task: Task) => setTaskForDetails(task), [])
  const closeDetailsModal = useCallback(() => setTaskForDetails(null), [])
  const openDeleteConfirm = useCallback((taskId: string) => setTaskToDeleteId(taskId), [])
  const closeDeleteConfirm = useCallback(() => setTaskToDeleteId(null), [])
  const exportTasks = useCallback(() => JSON.stringify(tasks, null, 2), [tasks])
  const importTasks = useCallback((tasksJson: string) => {
    try {
      const importedTasks = JSON.parse(tasksJson)
      if (Array.isArray(importedTasks)) {
        setTasks(importedTasks)
        return true
      }
    } catch (error) {
      console.error("Failed to import tasks:", error)
    }
    return false
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTaskCompletion,
        updateTaskTargetDate,
        deleteTask,
        updateTaskDetails,
        getTasksForCategory,
        openTaskFunctionsModal,
        closeTaskFunctionsModal,
        taskForFunctions,
        openDetailsModal,
        closeDetailsModal,
        taskForDetails,
        openDeleteConfirm,
        closeDeleteConfirm,
        taskToDeleteId,
        effectiveDate,
        isLoading,
        exportTasks,
        importTasks,
        notificationPermission,
        requestNotificationPermission,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
