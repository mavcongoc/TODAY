import type { Task } from "./types"

const STORAGE_KEY = "todayAppTasksV2"
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

export class TaskStorage {
  // Set tasks in both cookies and localStorage
  static setTasks(tasks: Task[]): void {
    const tasksJson = JSON.stringify(tasks)

    try {
      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, tasksJson)
      }

      // Store in cookies with expiration
      if (typeof document !== "undefined") {
        const expires = new Date(Date.now() + COOKIE_MAX_AGE).toUTCString()
        // Split large data into multiple cookies if needed (cookies have ~4KB limit)
        this.setCookieChunks(STORAGE_KEY, tasksJson, expires)
      }
    } catch (error) {
      console.warn("Failed to save tasks:", error)
    }
  }

  // Get tasks from cookies first, fallback to localStorage
  static getTasks(): Task[] {
    try {
      let tasksJson: string | null = null

      // Try cookies first
      if (typeof document !== "undefined") {
        tasksJson = this.getCookieChunks(STORAGE_KEY)
      }

      // Fallback to localStorage
      if (!tasksJson && typeof window !== "undefined") {
        tasksJson = localStorage.getItem(STORAGE_KEY)
      }

      if (tasksJson) {
        const tasks = JSON.parse(tasksJson)
        // Validate the data structure
        if (Array.isArray(tasks)) {
          return tasks.filter(
            (task) =>
              task &&
              typeof task.id === "string" &&
              typeof task.text === "string" &&
              typeof task.targetDate === "string" &&
              typeof task.completed === "boolean",
          )
        }
      }
    } catch (error) {
      console.warn("Failed to load tasks:", error)
    }

    return []
  }

  // Handle large data by splitting into multiple cookies
  private static setCookieChunks(key: string, value: string, expires: string): void {
    const chunkSize = 3000 // Leave room for cookie metadata
    const chunks = []

    for (let i = 0; i < value.length; i += chunkSize) {
      chunks.push(value.slice(i, i + chunkSize))
    }

    // Set the number of chunks
    document.cookie = `${key}_chunks=${chunks.length}; expires=${expires}; path=/; SameSite=Lax`

    // Set each chunk
    chunks.forEach((chunk, index) => {
      document.cookie = `${key}_${index}=${encodeURIComponent(chunk)}; expires=${expires}; path=/; SameSite=Lax`
    })
  }

  // Reconstruct data from multiple cookies
  private static getCookieChunks(key: string): string | null {
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [name, value] = cookie.trim().split("=")
        acc[name] = value
        return acc
      },
      {} as Record<string, string>,
    )

    const chunkCount = Number.parseInt(cookies[`${key}_chunks`] || "0")
    if (chunkCount === 0) return null

    let result = ""
    for (let i = 0; i < chunkCount; i++) {
      const chunk = cookies[`${key}_${i}`]
      if (!chunk) return null // Missing chunk, data is corrupted
      result += decodeURIComponent(chunk)
    }

    return result
  }

  // Clear all stored data
  static clearTasks(): void {
    try {
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
      }

      // Clear cookies
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";")
        cookies.forEach((cookie) => {
          const [name] = cookie.trim().split("=")
          if (name.startsWith(STORAGE_KEY)) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
          }
        })
      }
    } catch (error) {
      console.warn("Failed to clear tasks:", error)
    }
  }

  // Migrate old localStorage data to new storage system
  static migrateOldData(): void {
    try {
      if (typeof window !== "undefined") {
        const oldData = localStorage.getItem("todayAppTasks") // Old key
        if (oldData && !localStorage.getItem(STORAGE_KEY)) {
          const tasks = JSON.parse(oldData)
          this.setTasks(tasks)
          localStorage.removeItem("todayAppTasks") // Clean up old data
        }
      }
    } catch (error) {
      console.warn("Failed to migrate old data:", error)
    }
  }
}
