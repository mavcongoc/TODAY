"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task, TaskContextType, DueCategory, SubTask } from "@/lib/types"
import { getTodayDateString, getDueCategory } from "@/lib/date-utils"
import { TaskStorage } from "@/lib/storage"
import { format } from "date-fns" // Import format

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskForFunctions, setTaskForFunctions] = useState<Task | null>(null)
  const [taskForDetails, setTaskForDetails] = useState<Task | null>(null)
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null)
  const [effectiveDate, setEffectiveDate] = useState<string>(getTodayDateString())
  const [isLoading, setIsLoading] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  // Initialize notification permission state on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Load tasks on mount
  useEffect(() => {
    try {
      TaskStorage.migrateOldData()
      const storedTasks = TaskStorage.getTasks()
      setTasks(storedTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      TaskStorage.setTasks(tasks)
    }
  }, [tasks, isLoading])

  // Check for date changes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getTodayDateString()
      if (newToday !== effectiveDate) {
        setEffectiveDate(newToday)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [effectiveDate])

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support desktop notifications.")
      return "denied" as NotificationPermission
    }
    if (Notification.permission === "granted") {
      setNotificationPermission("granted")
      return "granted" as NotificationPermission
    }
    if (Notification.permission === "denied") {
      alert(
        "Notification permission was previously denied. Please enable it in your browser settings if you want alarms.",
      )
      setNotificationPermission("denied")
      return "denied" as NotificationPermission
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === "denied") {
      alert("Notifications permission denied. You won't receive alarm alerts.")
    }
    return permission
  }, [])

  // Alarm checking logic
  useEffect(() => {
    if (notificationPermission !== "granted" || isLoading) {
      return // Don't check alarms if permission isn't granted or tasks are loading
    }

    const alarmCheckInterval = setInterval(() => {
      const now = new Date()
      const currentDateStr = format(now, "yyyy-MM-dd")
      const currentTimeStr = format(now, "HH:mm")

      tasks.forEach((task) => {
        if (
          task.alarmTime &&
          !task.completed &&
          task.targetDate === currentDateStr &&
          task.alarmTime === currentTimeStr
        ) {
          const alarmFiredKey = `alarm_fired_${task.id}_${task.targetDate}_${task.alarmTime}`
          if (sessionStorage.getItem(alarmFiredKey)) {
            return // Alarm already fired for this task at this time in this session
          }

          console.log(`Alarm ringing for task: ${task.text}`)
          // Ensure placeholder-logo.png is in public folder or use a valid path
          const notification = new Notification(`Today App: ${task.text}`, {
            body: `It's time for your task!`,
            icon: "/placeholder-logo.png", // Make sure this icon exists in /public
            vibrate: [200, 100, 200], // A simple vibration pattern
            tag: task.id, // Use task ID as tag to prevent multiple notifications for the same task if logic re-runs quickly
          })

          notification.onclick = () => {
            window.focus() // Focus the tab when notification is clicked
            // Potentially navigate to the task or open details
          }

          sessionStorage.setItem(alarmFiredKey, "true")
          // Auto-clear this session storage item after 65 seconds to allow re-notification if app is kept open and time passes
          setTimeout(() => sessionStorage.removeItem(alarmFiredKey), 65 * 1000)
        }
      })
    }, 20 * 1000) // Check every 20 seconds

    return () => clearInterval(alarmCheckInterval)
  }, [tasks, notificationPermission, isLoading])

  const addTask = useCallback((text: string, targetDate: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      targetDate,
      completed: false,
      createdAt: new Date().toISOString(),
      notes: "",
      subTasks: [],
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
          if (category === "today") {
            return taskCategory === "today"
          }
          return taskCategory === category
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
