"use client"

import type React from "react"
import { useState } from "react"
import { useSwipeable } from "react-swipeable"
import type { Task } from "@/lib/types"
import { useTasks } from "@/contexts/task-context"
import { Checkbox } from "@/components/ui/checkbox"
import { useLongPress } from "@/hooks/use-long-press"
import { cn } from "@/lib/utils"
import { Trash2, ListChecks, Edit3, AlarmClock } from "lucide-react" // Added AlarmClock

interface TaskItemProps {
  task: Task
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, openTaskFunctionsModal, openDetailsModal, openDeleteConfirm } = useTasks()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTaskSwiping, setIsTaskSwiping] = useState(false)

  const handleCheckboxAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleTaskCompletion(task.id)
  }

  const handleTaskTextInteraction = () => {
    if (isTaskSwiping) {
      return
    }
    openTaskFunctionsModal(task)
  }

  const { handlers: taskTextLongPressHandlers, cancel: cancelLongPress } = useLongPress(
    handleTaskTextInteraction,
    handleTaskTextInteraction,
    {
      delay: 700,
      moveThreshold: 5,
    },
  )

  const resetSwipe = () => {
    setSwipeOffset(0)
    setIsTaskSwiping(false)
  }

  const taskSwipeHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      cancelLongPress()
      setIsTaskSwiping(true)
      eventData.event.stopPropagation()
    },
    onSwiping: (eventData) => {
      eventData.event.stopPropagation()
      if (Math.abs(eventData.deltaY) > Math.abs(eventData.deltaX)) return
      let offset = eventData.deltaX
      if (offset > 100) offset = 100
      if (offset < -100) offset = -100
      setSwipeOffset(offset)
    },
    onSwiped: (eventData) => {
      eventData.event.stopPropagation()
      const threshold = 50
      if (eventData.dir === "Left" && Math.abs(eventData.deltaX) > threshold) {
        openDeleteConfirm(task.id)
      } else if (eventData.dir === "Right" && Math.abs(eventData.deltaX) > threshold) {
        openDetailsModal(task)
      }
      setTimeout(resetSwipe, 150)
    },
    onSwipeCancel: () => {
      resetSwipe()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 5,
  })

  const hasMoreInfo = (task.notes && task.notes.trim() !== "") || (task.subTasks && task.subTasks.length > 0)
  const hasAlarm = task.alarmTime && task.alarmTime.trim() !== ""

  return (
    <div
      {...taskSwipeHandlers}
      className="relative bg-white dark:bg-neutral-800 overflow-hidden border-b border-neutral-200 dark:border-neutral-700 select-none touch-manipulation"
      data-task-item="true"
    >
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

      <div
        className={cn(
          "flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 transition-transform duration-150 ease-out",
          task.completed && "bg-neutral-100 dark:bg-neutral-700",
          isTaskSwiping && "cursor-grabbing",
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div
          onClick={handleCheckboxAreaClick}
          className="shrink-0 p-1 -m-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          role="button"
          aria-label="Toggle task completion"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              e.stopPropagation()
              toggleTaskCompletion(task.id)
            }
          }}
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            className="w-5 h-5 rounded pointer-events-none"
            aria-labelledby={`task-text-${task.id}`}
          />
        </div>

        <div
          {...taskTextLongPressHandlers}
          className="flex-grow cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={`Task: ${task.text}. Tap or long press for options.`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleTaskTextInteraction()
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

        {/* Container for right-side icons (alarm, more info) */}
        <div className="flex items-center shrink-0 ml-auto pl-2 space-x-2">
          {hasAlarm && (
            <AlarmClock
              size={16}
              className="text-blue-600 dark:text-blue-400"
              title={`Alarm set for ${task.alarmTime}`}
            />
          )}
          {hasMoreInfo && (
            <ListChecks
              size={18}
              className="text-neutral-400 dark:text-neutral-500"
              title="Task has notes or sub-tasks"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskItem
