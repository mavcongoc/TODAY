"use client"

import { useState, useRef } from "react"
import { useSwipeable } from "react-swipeable"
import { TaskProvider, useTasks } from "@/contexts/task-context"
import ViewHeader from "@/components/view-header"
import TaskInput from "@/components/task-input"
import TaskListContainer from "@/components/task-list-container"
import DueDateReassignModal from "@/components/due-date-reassign-modal"
import TaskDetailsModal from "@/components/task-details-modal"
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog"
import LoadingSpinner from "@/components/loading-spinner"
import type { DueCategory } from "@/lib/types"

const views: DueCategory[] = ["today", "tomorrow", "next3days"]

function TodayAppContent() {
  const [currentViewIndex, setCurrentViewIndex] = useState(0)
  const { isLoading } = useTasks()
  const taskListRef = useRef<HTMLDivElement>(null)

  const navigateToView = (index: number) => {
    setCurrentViewIndex(Math.max(0, Math.min(index, views.length - 1)))
  }

  const handleSwipeLeft = () => navigateToView(currentViewIndex + 1)
  const handleSwipeRight = () => navigateToView(currentViewIndex - 1)

  // Page-level swipe handlers - but we'll be more selective about when to use them
  const pageSwipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      // Only handle page swipe if the swipe didn't originate from a task item
      const target = eventData.event.target as HTMLElement
      const isTaskSwipe = target.closest("[data-task-item]")

      if (!isTaskSwipe) {
        handleSwipeLeft()
      }
    },
    onSwipedRight: (eventData) => {
      // Only handle page swipe if the swipe didn't originate from a task item
      const target = eventData.event.target as HTMLElement
      const isTaskSwipe = target.closest("[data-task-item]")

      if (!isTaskSwipe) {
        handleSwipeRight()
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-neutral-50 text-neutral-800 antialiased">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-800 antialiased">
      <ViewHeader
        currentViewLabel={views[currentViewIndex]}
        onPrev={currentViewIndex > 0 ? () => navigateToView(currentViewIndex - 1) : undefined}
        onNext={currentViewIndex < views.length - 1 ? () => navigateToView(currentViewIndex + 1) : undefined}
        isFirstView={currentViewIndex === 0}
        isLastView={currentViewIndex === views.length - 1}
      />
      <TaskInput />
      <main {...pageSwipeHandlers} className="flex-grow flex flex-col overflow-hidden">
        <TaskListContainer currentViewIndex={currentViewIndex} views={views} ref={taskListRef} />
      </main>
      <DueDateReassignModal />
      <TaskDetailsModal />
      <DeleteConfirmationDialog />
    </div>
  )
}

export default function TodayAppPage() {
  return (
    <TaskProvider>
      <TodayAppContent />
    </TaskProvider>
  )
}
