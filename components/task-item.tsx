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
    // Stop propagation to prevent triggering parent handlers
    e.stopPropagation()
    toggleTaskCompletion(task.id)
  }

  const handleCheckboxChange = (checked: boolean) => {
    // This is called by the Checkbox component itself
    toggleTaskCompletion(task.id)
  }

  const handleLongPress = () => {
    // This check is now redundant because cancelCondition handles it in useLongPress
    // if (isTaskSwiping) return;
    console.log("Long press triggered for:", task.text)
    openReassignModal(task)
  }

  // Pass isTaskSwiping as the cancelCondition to prevent long press during a swipe
  const longPressEvents = useLongPress(handleLongPress, handleTaskTextClick, {
    delay: 500,
    cancelCondition: isTaskSwiping, // CRITICAL: Pass the swiping state here
  })

  const resetSwipe = () => {
    setSwipeOffset(0)
    setIsTaskSwiping(false)
  }

  // Task-level swipe handlers with aggressive event stopping
  const taskSwipeHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      console.log("Task swipe started")
      setIsTaskSwiping(true) // Set swiping state immediately
      // Stop the event from reaching parent handlers
      eventData.event.stopPropagation()
      if (eventData.event.cancelable) {
        eventData.event.preventDefault()
      }
    },
    onSwiping: (eventData) => {
      console.log("Task swiping:", eventData.deltaX)
      // Stop the event from reaching parent handlers
      eventData.event.stopPropagation()
      if (eventData.event.cancelable) {
        eventData.event.preventDefault()
      }

      // Only handle horizontal swipes
      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) {
        return
      }

      // Limit the swipe offset
      let offset = eventData.deltaX
      if (offset > 100) offset = 100
      if (offset < -100) offset = -100

      setSwipeOffset(offset)
    },
    onSwiped: (eventData) => {
      console.log("Task swiped:", eventData.dir, "Delta:", eventData.deltaX)

      // Stop the event from reaching parent handlers
      eventData.event.stopPropagation()
      if (eventData.event.cancelable) {
        eventData.event.preventDefault()
      }

      const threshold = 60

      if (eventData.dir === "Left" && Math.abs(eventData.deltaX) > threshold) {
        console.log("Opening delete confirm for:", task.text)
        openDeleteConfirm(task.id)
      } else if (eventData.dir === "Right" && Math.abs(eventData.deltaX) > threshold) {
        console.log("Opening details modal for:", task.text)
        openDetailsModal(task)
      }

      // Reset after a short delay to allow the action to process
      setTimeout(resetSwipe, 100)
    },
    onSwipeCancel: () => {
      console.log("Task swipe cancelled")
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
      className="relative bg-white overflow-hidden border-b border-neutral-200 select-none touch-manipulation no-select"
      data-task-item="true"
      style={{ touchAction: "pan-y" }} // Allow vertical scrolling but capture horizontal swipes
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
        {/* Checkbox Area - Isolated interaction */}
        <div className="shrink-0 p-1 -m-1 cursor-pointer rounded hover:bg-neutral-100" onClick={handleCheckboxClick}>
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckboxChange}
            className="w-5 h-5 rounded pointer-events-none" // Disable pointer events on checkbox itself
            aria-labelledby={`task-text-${task.id}`}
          />
        </div>

        {/* Text Area - Has long press and click handlers */}
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

        {/* More Info Icon */}
        {hasMoreInfo && <ListChecks size={18} className="text-neutral-400 shrink-0" />}
      </div>
    </div>
  )
}

export default TaskItem
