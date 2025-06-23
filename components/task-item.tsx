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
    if (isTaskSwiping) {
      console.log("TaskItem: Click ignored due to active swipe.")
      return
    }
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
    if (isTaskSwiping) {
      console.log("TaskItem: Long press ignored due to active swipe.")
      return
    }
    openReassignModal(task)
  }

  const longPressEvents = useLongPress(handleLongPress, handleTaskTextClick, {
    delay: 500,
    moveThreshold: 8, // Slightly more sensitive to catch swipes earlier
  })

  const resetSwipe = () => {
    setSwipeOffset(0)
    setIsTaskSwiping(false)
  }

  const taskSwipeHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      console.log("Swipe started:", eventData.dir)
      setIsTaskSwiping(true)
      eventData.event.stopPropagation()
    },
    onSwiping: (eventData) => {
      eventData.event.stopPropagation()

      // Prioritize horizontal movement over vertical
      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) {
        return
      }

      let offset = eventData.deltaX
      // Limit swipe offset for visual feedback
      if (offset > 100) offset = 100
      if (offset < -100) offset = -100
      setSwipeOffset(offset)
    },
    onSwiped: (eventData) => {
      console.log("Swipe completed:", eventData.dir, "deltaX:", eventData.deltaX)
      eventData.event.stopPropagation()

      const threshold = 50 // Reduced threshold to make swipes more responsive

      if (eventData.dir === "Left" && Math.abs(eventData.deltaX) > threshold) {
        console.log("Triggering delete confirm")
        openDeleteConfirm(task.id)
      } else if (eventData.dir === "Right" && Math.abs(eventData.deltaX) > threshold) {
        console.log("Triggering details modal")
        openDetailsModal(task)
      }

      // Reset swipe state after a short delay
      setTimeout(resetSwipe, 150)
    },
    onSwipeCancel: (eventData) => {
      console.log("Swipe cancelled")
      resetSwipe()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 8, // Reduced to match useLongPress moveThreshold for consistency
  })

  const hasMoreInfo = (task.notes && task.notes.trim() !== "") || (task.subTasks && task.subTasks.length > 0)

  return (
    <div
      className="relative bg-white dark:bg-neutral-800 overflow-hidden border-b border-neutral-200 dark:border-neutral-700 select-none touch-manipulation"
      data-task-item="true"
    >
      {/* Swipe action visual feedback */}
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-green-500 text-white transition-opacity duration-150"
        style={{
          width: "60px",
          transform: "translateX(-100%)",
          opacity: swipeOffset > 10 ? Math.min(swipeOffset / 60, 1) : 0,
        }}
      >
        <Edit3 size={24} />
      </div>
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white transition-opacity duration-150"
        style={{
          width: "60px",
          transform: "translateX(100%)",
          opacity: swipeOffset < -10 ? Math.min(Math.abs(swipeOffset) / 60, 1) : 0,
        }}
      >
        <Trash2 size={24} />
      </div>

      {/* Task Item Content */}
      <div
        {...longPressEvents}
        {...taskSwipeHandlers}
        className={cn(
          "flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 transition-transform duration-150 ease-out",
          task.completed && "bg-neutral-100 dark:bg-neutral-700",
          isTaskSwiping && "cursor-grabbing",
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div
          className="shrink-0 p-1 -m-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckboxChange}
            className="w-5 h-5 rounded pointer-events-none"
            aria-labelledby={`task-text-${task.id}`}
          />
        </div>

        <div
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
            className={cn(
              "text-neutral-800 dark:text-neutral-100 text-lg",
              task.completed && "line-through text-neutral-500 dark:text-neutral-400",
            )}
          >
            {task.text}
          </p>
        </div>

        {hasMoreInfo && <ListChecks size={18} className="text-neutral-400 dark:text-neutral-500 shrink-0" />}
      </div>
    </div>
  )
}

export default TaskItem
