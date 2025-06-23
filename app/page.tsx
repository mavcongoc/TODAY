"use client"

import { useState, useRef, useEffect } from "react"
import { useSwipeable } from "react-swipeable"
import { TaskProvider, useTasks } from "@/contexts/task-context"
import ViewHeader from "@/components/view-header"
import TaskInput from "@/components/task-input"
import TaskListContainer from "@/components/task-list-container"
import TaskFunctionsModal from "@/components/task-functions-modal" // Renamed import
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

  const pageSwipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const target = eventData.event.target as HTMLElement
      const isTaskSwipe = target.closest("[data-task-item]")
      if (!isTaskSwipe) handleSwipeLeft()
    },
    onSwipedRight: (eventData) => {
      const target = eventData.event.target as HTMLElement
      const isTaskSwipe = target.closest("[data-task-item]")
      if (!isTaskSwipe) handleSwipeRight()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  })

  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]')
    if (metaViewport) {
      metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-neutral-50 text-neutral-800 antialiased">
        <LoadingSpinner />
      </div>
    )
  }

  const currentViewCategory = views[currentViewIndex]

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-800 antialiased">
      <ViewHeader
        currentViewLabel={currentViewCategory}
        onPrev={currentViewIndex > 0 ? () => navigateToView(currentViewIndex - 1) : undefined}
        onNext={currentViewIndex < views.length - 1 ? () => navigateToView(currentViewIndex + 1) : undefined}
        isFirstView={currentViewIndex === 0}
        isLastView={currentViewIndex === views.length - 1}
      />
      <TaskInput currentView={currentViewCategory} />
      <main {...pageSwipeHandlers} className="flex-grow flex flex-col overflow-hidden">
        <TaskListContainer currentViewIndex={currentViewIndex} views={views} ref={taskListRef} />
      </main>
      <TaskFunctionsModal /> {/* Renamed component */}
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
