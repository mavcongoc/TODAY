"use client"

import type React from "react"
import { useState } from "react"
import { useSwipeable } from "react-swipeable"
import type { Task } from "@/lib/types"
import { useTasks } from "@/contexts/task-context"
import { Checkbox } from "@/components/ui/checkbox"
import { useLongPress } from "@/hooks/use-long-press"
import { cn } from "@/lib/utils"
import { Trash2, ListChecks, Edit3 } from "lucide-react"

interface TaskItemProps {
  task: Task
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, openReassignModal, openDetailsModal, openDeleteConfirm } = useTasks()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTaskSwiping, setIsTaskSwiping] = useState(false)

  const handleTaskTextClick = () => {
    if (isTaskSwiping) return // Don't toggle if we're in the middle of a swipe
    toggleTaskCompletion(task.id)
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleTaskCompletion(task.id)
  }

  const handleCheckboxChange = () => {
    toggleTaskCompletion(task.id)
  }

  const handleLongPress = () => {
    openReassignModal(task)
  }

  const longPressEvents = useLongPress(handleLongPress, handleTaskTextClick, {
    delay: 500,
    cancelCondition: isTaskSwiping, // Prevent long press if swipe is active
  })

  const resetSwipe = () => {
    setSwipeOffset(0)
    setIsTaskSwiping(false)
  }

  const taskSwipeHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      setIsTaskSwiping(true)
      eventData.event.stopPropagation()
    },
    onSwiping: (eventData) => {
      eventData.event.stopPropagation()
      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) {
        return
      }
      let offset = eventData.deltaX
      if (offset > 100) offset = 100
      if (offset < -100) offset = -100
      setSwipeOffset(offset)
    },
    onSwiped: (eventData) => {
      eventData.event.stopPropagation()
      const threshold = 60
      if (eventData.dir === "Left" && Math.abs(eventData.deltaX) > threshold) {
        openDeleteConfirm(task.id)
      } else if (eventData.dir === "Right" && Math.abs(eventData.deltaX) > threshold) {
        openDetailsModal(task)
      }
      setTimeout(resetSwipe, 100)
    },
    onSwipeCancel: () => {
      resetSwipe()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 10,
  })

  const hasMoreInfo = (task.notes && task.notes.trim() !== "") || (task.subTasks && task.subTasks.length > 0)

  return (
    <div
      className="relative bg-white overflow-hidden border-b border-neutral-200 select-none touch-manipulation"
      data-task-item="true"
    >
      {/* Visual feedback during swipe */}
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-green-500 text-white"
        style={{ width: "60px", transform: "translateX(-100%)" }}
      >
        <Edit3 size={24} />
      </div>
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white"
        style={{ width: "60px", transform: "translateX(100%)" }}
      >
        <Trash2 size={24} />
      </div>

      {/* Task Item Content */}
      <div
        {...taskSwipeHandlers}
        className={cn(
          "flex items-center gap-3 p-4 bg-white transition-transform duration-150 ease-out",
          task.completed && "bg-neutral-100",
          isTaskSwiping && "cursor-grabbing",
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className="shrink-0 p-1 -m-1 cursor-pointer rounded hover:bg-neutral-100" onClick={handleCheckboxClick}>
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckboxChange}
            className="w-5 h-5 rounded pointer-events-none"
            aria-labelledby={`task-text-${task.id}`}
          />
        </div>

        <div
          {...longPressEvents}
          className="flex-grow cursor-pointer"
          role="button"
          tabIndex={0}
          aria-pressed={task.completed}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleTaskTextClick()
            }
          }}
        >
          <p
            id={`task-text-${task.id}`}
            className={cn("text-neutral-800 text-lg", task.completed && "line-through text-neutral-500")}
          >
            {task.text}
          </p>
        </div>

        {hasMoreInfo && <ListChecks size={18} className="text-neutral-400 shrink-0" />}
      </div>
    </div>
  )
}

export default TaskItem
