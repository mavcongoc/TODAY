"use client"
import { forwardRef } from "react"
import { useTasks } from "@/contexts/task-context"
import TaskList from "./task-list"
import type { DueCategory } from "@/lib/types"

interface TaskListContainerProps {
  currentViewIndex: number
  views: DueCategory[]
}

const viewDisplayNames: Record<DueCategory, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  next3days: "Next 3 Days",
}

const TaskListContainer = forwardRef<HTMLDivElement, TaskListContainerProps>(({ currentViewIndex, views }, ref) => {
  const { getTasksForCategory } = useTasks()

  return (
    <div className="flex-grow relative" ref={ref}>
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentViewIndex * 100}%)` }}
      >
        {views.map((viewCategory) => (
          <div key={viewCategory} className="w-full h-full shrink-0 overflow-y-auto">
            <div className="max-w-md mx-auto h-full flex flex-col">
              <TaskList tasks={getTasksForCategory(viewCategory)} categoryLabel={viewDisplayNames[viewCategory]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

TaskListContainer.displayName = "TaskListContainer"

export default TaskListContainer
