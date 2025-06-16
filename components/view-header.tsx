"use client"

import type React from "react"
import type { DueCategory } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTasks } from "@/contexts/task-context"
import { formatDateForDisplay } from "@/lib/date-utils"
import { parseISO, addDays, format } from "date-fns"

interface ViewHeaderProps {
  currentViewLabel: DueCategory
  onPrev?: () => void
  onNext?: () => void
  isFirstView?: boolean
  isLastView?: boolean
}

const viewDisplayNames: Record<DueCategory, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  next3days: "Next 3 Days",
}

const ViewHeader: React.FC<ViewHeaderProps> = ({ currentViewLabel, onPrev, onNext, isFirstView, isLastView }) => {
  const { effectiveDate } = useTasks() // effectiveDate is in "yyyy-MM-dd"

  let dateForViewHeader: string

  if (currentViewLabel === "today") {
    dateForViewHeader = effectiveDate
  } else if (currentViewLabel === "tomorrow") {
    dateForViewHeader = format(addDays(parseISO(effectiveDate), 1), "yyyy-MM-dd")
  } else {
    // next3days
    // For "Next 3 Days", display the date for two days from the effectiveDate.
    // This aligns with the earliest a task explicitly set for "Next 3 Days" might be.
    dateForViewHeader = format(addDays(parseISO(effectiveDate), 2), "yyyy-MM-dd")
  }

  const displayDate = formatDateForDisplay(dateForViewHeader)

  return (
    <header className="p-4 text-center bg-neutral-100 border-b border-neutral-200 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={onPrev}
          disabled={isFirstView}
          className={`p-2 ${isFirstView ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-200 rounded-full"}`}
          aria-label="Previous view"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-semibold text-neutral-800 capitalize">{viewDisplayNames[currentViewLabel]}</h1>
          <span className="text-xs text-neutral-500 -mt-0.5">{displayDate}</span>
        </div>
        <button
          onClick={onNext}
          disabled={isLastView}
          className={`p-2 ${isLastView ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-200 rounded-full"}`}
          aria-label="Next view"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </header>
  )
}

export default ViewHeader
