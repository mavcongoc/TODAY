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
}

export interface TaskContextType {
  tasks: Task[]
  addTask: (text: string, targetDate: string) => void
  toggleTaskCompletion: (id: string) => void
  updateTaskTargetDate: (id: string, newTargetDate: string) => void
  deleteTask: (id: string) => void
  updateTaskDetails: (id: string, details: { notes?: string; subTasks?: SubTask[] }) => void
  getTasksForCategory: (category: DueCategory) => Task[]

  // For DueDateReassignModal
  openReassignModal: (task: Task) => void
  closeReassignModal: () => void
  taskToReassign: Task | null

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
}
