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
  const [isTaskSwiping, setIsTaskSwiping] = useState(false) // Tracks if react-swipeable has initiated a swipe

  const handleTaskTextClick = () => {
    // This click is only valid if react-swipeable hasn't started a swipe
    // The useLongPress hook itself also checks if it was cancelled by movement.
    if (isTaskSwiping) {
      console.log("TaskItem: Click ignored due to active swipe.")
      return
    }
    toggleTaskCompletion(task.id)
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent this click from bubbling to the long press/swipe div
    toggleTaskCompletion(task.id)
  }

  const handleCheckboxChange = () => {
    toggleTaskCompletion(task.id)
  }

  const handleLongPress = () => {
    // This will only be called by useLongPress if it wasn't cancelled by movement
    // and if react-swipeable hasn't taken over.
    if (isTaskSwiping) {
      console.log("TaskItem: Long press ignored due to active swipe.")
      return
    }
    openReassignModal(task)
  }

  // useLongPress will handle its own movement detection.
  // The onClick (handleTaskTextClick) will be called by useLongPress only if it's a valid click.
  const longPressEvents = useLongPress(handleLongPress, handleTaskTextClick, {
    delay: 500,
    moveThreshold: 10, // Standard threshold
  })

  const resetSwipe = () => {
    setSwipeOffset(0)
    setIsTaskSwiping(false)
  }

  const taskSwipeHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      setIsTaskSwiping(true) // Signal that a swipe has started
      eventData.event.stopPropagation() // Stop propagation to prevent page scroll/swipe
    },
    onSwiping: (eventData) => {
      eventData.event.stopPropagation()
      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) {
        // Prioritize vertical scroll if movement is more vertical
        // This might not be needed if preventScrollOnSwipe is effective
        return
      }
      let offset = eventData.deltaX
      // Limit swipe offset for visual feedback
      if (offset > 100) offset = 100
      if (offset < -100) offset = -100
      setSwipeOffset(offset)
    },
    onSwiped: (eventData) => {
      eventData.event.stopPropagation()
      const threshold = 60 // Threshold for swipe action to trigger
      if (eventData.dir === "Left" && Math.abs(eventData.deltaX) > threshold) {
        openDeleteConfirm(task.id)
      } else if (eventData.dir === "Right" && Math.abs(eventData.deltaX) > threshold) {
        openDetailsModal(task)
      }
      // Reset swipe state after a short delay to allow UI to update or action to process
      setTimeout(resetSwipe, 150)
    },
    onSwipeCancel: () => {
      resetSwipe()
    },
    preventScrollOnSwipe: true, // Prevent page scroll during horizontal swipe
    trackMouse: true,
    trackTouch: true,
    delta: 10, // Min distance for a swipe to be registered by react-swipeable
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
        style={{ width: "60px", transform: "translateX(-100%)", opacity: swipeOffset > 10 ? 1 : 0 }}
      >
        <Edit3 size={24} />
      </div>
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white transition-opacity duration-150"
        style={{ width: "60px", transform: "translateX(100%)", opacity: swipeOffset < -10 ? 1 : 0 }}
      >
        <Trash2 size={24} />
      </div>

      {/* Task Item Content - This div gets both longPress and swipe handlers */}
      <div
        {...longPressEvents} // Order might matter if event propagation isn't handled perfectly by both
        {...taskSwipeHandlers}
        className={cn(
          "flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 transition-transform duration-150 ease-out",
          task.completed && "bg-neutral-100 dark:bg-neutral-700",
          isTaskSwiping && "cursor-grabbing", // Visual feedback for swiping
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {/* Checkbox Area - Isolated interaction */}
        <div
          className="shrink-0 p-1 -m-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckboxChange} // Use onCheckedChange for shadcn/ui Checkbox
            className="w-5 h-5 rounded pointer-events-none" // Let parent div handle click for consistency
            aria-labelledby={`task-text-${task.id}`}
          />
        </div>

        {/* Text Area - Target for long press and click (via useLongPress) */}
        <div
          className="flex-grow cursor-pointer"
          role="button" // Semantically a button
          tabIndex={0} // Make it focusable
          aria-pressed={task.completed}
          onKeyDown={(e) => {
            // Keyboard accessibility for click
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleTaskTextClick() // This will be gated by isTaskSwiping
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

        {/* More Info Icon */}
        {hasMoreInfo && <ListChecks size={18} className="text-neutral-400 dark:text-neutral-500 shrink-0" />}
      </div>
    </div>
  )
}

export default TaskItem
