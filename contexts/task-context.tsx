"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task, TaskContextType, DueCategory, SubTask } from "@/lib/types"
import { getTodayDateString, getDueCategory } from "@/lib/date-utils"
import { TaskStorage } from "@/lib/storage"

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskForFunctions, setTaskForFunctions] = useState<Task | null>(null) // Renamed
  const [taskForDetails, setTaskForDetails] = useState<Task | null>(null)
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null)
  const [effectiveDate, setEffectiveDate] = useState<string>(getTodayDateString())
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks on mount
  useEffect(() => {
    try {
      // Migrate any old data first
      TaskStorage.migrateOldData()

      // Load tasks from storage
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
      // Don't save during initial load
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
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [effectiveDate])

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
    setTaskForFunctions(null) // Close modal after update
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

  const openTaskFunctionsModal = useCallback((task: Task) => setTaskForFunctions(task), []) // Renamed
  const closeTaskFunctionsModal = useCallback(() => setTaskForFunctions(null), []) // Renamed

  const openDetailsModal = useCallback((task: Task) => {
    setTaskForDetails(task)
  }, [])
  const closeDetailsModal = useCallback(() => setTaskForDetails(null), [])

  const openDeleteConfirm = useCallback((taskId: string) => {
    setTaskToDeleteId(taskId)
  }, [])
  const closeDeleteConfirm = useCallback(() => setTaskToDeleteId(null), [])

  // Export function for debugging/backup
  const exportTasks = useCallback(() => {
    return JSON.stringify(tasks, null, 2)
  }, [tasks])

  // Import function for restoring from backup
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
        openTaskFunctionsModal, // Renamed
        closeTaskFunctionsModal, // Renamed
        taskForFunctions, // Renamed
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
