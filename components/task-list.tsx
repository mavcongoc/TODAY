import type React from "react"
import type { Task } from "@/lib/types"
import TaskItem from "./task-item"
import { AlertCircle } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  categoryLabel: string
}

const TaskList: React.FC<TaskListProps> = ({ tasks, categoryLabel }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-neutral-500 py-10 px-4 h-full">
        <AlertCircle size={48} className="mb-4 text-neutral-400" />
        <p className="text-lg text-center">No tasks for {categoryLabel.toLowerCase()}.</p>
        <p className="text-sm text-center">Add some tasks or check other views!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-200">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}

export default TaskList
