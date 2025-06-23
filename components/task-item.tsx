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
  const { toggleTaskCompletion, openTaskFunctionsModal, openDetailsModal, openDeleteConfirm } = useTasks() // Renamed openReassignModal
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTaskSwiping, setIsTaskSwiping] = useState(false)

  // This function is now only for the task text area, and it opens the functions modal
  const handleTaskTextClickOrLongPress = () => {
    if (isTaskSwiping) {
      console.log("TaskItem: Click/Long press ignored due to active swipe.")
      return
    }
    openTaskFunctionsModal(task) // Open the new TaskFunctionsModal
  }

  // This function is ONLY for the checkbox
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent this click from bubbling to the long press/swipe div
    toggleTaskCompletion(task.id)
  }

  // This function is ONLY for the checkbox
  const handleCheckboxChange = () => {
    toggleTaskCompletion(task.id)
  }

  // useLongPress will now trigger handleTaskTextClickOrLongPress for both short tap and long press
  const { handlers: longPressHandlers, cancel: cancelLongPress } = useLongPress(
    handleTaskTextClickOrLongPress, // What happens on long press
    handleTaskTextClickOrLongPress, // What happens on short click/tap
    {
      delay: 500,
      moveThreshold: 5,
    },
  )

  const resetSwipe = () => {
    setSwipeOffset(0)
    setIsTaskSwiping(false)
  }

  const taskSwipeHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      console.log("Swipe started:", eventData.dir)
      cancelLongPress() // Immediately cancel long press when any swipe starts
      setIsTaskSwiping(true)
      eventData.event.stopPropagation()
    },
    onSwiping: (eventData) => {
      eventData.event.stopPropagation()

      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) {
        return // Prioritize vertical scroll
      }

      let offset = eventData.deltaX
      if (offset > 100) offset = 100
      if (offset < -100) offset = -100
      setSwipeOffset(offset)
    },
    onSwiped: (eventData) => {
      console.log("Swipe completed:", eventData.dir, "deltaX:", eventData.deltaX)
      eventData.event.stopPropagation()

      const threshold = 50

      if (eventData.dir === "Left" && Math.abs(eventData.deltaX) > threshold) {
        console.log("Triggering delete confirm")
        openDeleteConfirm(task.id)
      } else if (eventData.dir === "Right" && Math.abs(eventData.deltaX) > threshold) {
        console.log("Triggering details modal")
        openDetailsModal(task)
      }

      setTimeout(resetSwipe, 150)
    },
    onSwipeCancel: (eventData) => {
      console.log("Swipe cancelled")
      resetSwipe()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 5,
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
        {...longPressHandlers} // Handles both long press and short tap for opening TaskFunctionsModal
        {...taskSwipeHandlers}
        className={cn(
          "flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 transition-transform duration-150 ease-out",
          task.completed && "bg-neutral-100 dark:bg-neutral-700",
          isTaskSwiping && "cursor-grabbing",
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {/* Checkbox Area - ONLY for toggling completion */}
        <div
          className="shrink-0 p-1 -m-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckboxChange}
            className="w-5 h-5 rounded" // Removed pointer-events-none
            aria-labelledby={`task-text-${task.id}`}
          />
        </div>

        {/* Text Area - Target for long press and click (via useLongPress) */}
        <div
          className="flex-grow cursor-pointer"
          role="button"
          tabIndex={0}
          aria-pressed={task.completed}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleTaskTextClickOrLongPress() // Keyboard also opens modal
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
