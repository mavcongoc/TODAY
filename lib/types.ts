export type DueCategory = "today" | "tomorrow" | "next3days"

export interface SubTask {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  text: string
  targetDate: string // YYYY-MM-DD format
  completed: boolean
  createdAt: string // ISO string for timestamp
  notes?: string
  subTasks?: SubTask[]
  alarmTime?: string // HH:mm format for alarm
}

export interface TaskContextType {
  tasks: Task[]
  addTask: (text: string, targetDate: string) => void
  toggleTaskCompletion: (id: string) => void
  updateTaskTargetDate: (id: string, newTargetDate: string) => void
  deleteTask: (id: string) => void
  updateTaskDetails: (id: string, details: { notes?: string; subTasks?: SubTask[]; alarmTime?: string | null }) => void
  getTasksForCategory: (category: DueCategory) => Task[]

  // For TaskFunctionsModal (formerly DueDateReassignModal)
  openTaskFunctionsModal: (task: Task) => void
  closeTaskFunctionsModal: () => void
  taskForFunctions: Task | null // Renamed from taskToReassign

  // For TaskDetailsModal
  openDetailsModal: (task: Task) => void
  closeDetailsModal: () => void
  taskForDetails: Task | null

  // For Delete Confirmation
  openDeleteConfirm: (taskId: string) => void
  closeDeleteConfirm: () => void
  taskToDeleteId: string | null

  effectiveDate: string // To trigger re-renders on date change
  isLoading: boolean // Loading state
  exportTasks: () => string // For backup/export
  importTasks: (tasksJson: string) => boolean // For restore/import

  // For Notifications
  notificationPermission: NotificationPermission | null // Can be 'default', 'granted', 'denied'
  requestNotificationPermission: () => Promise<NotificationPermission | void>
}
