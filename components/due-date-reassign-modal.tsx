"use client"

import type React from "react"
import { useTasks } from "@/contexts/task-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { getTargetDateForCategory, formatDateForDisplay } from "@/lib/date-utils"

const DueDateReassignModal: React.FC = () => {
  const { taskToReassign, closeReassignModal, updateTaskTargetDate } = useTasks()

  if (!taskToReassign) {
    return null
  }

  const handleReassign = (category: "today" | "tomorrow" | "next3days") => {
    const newTargetDate = getTargetDateForCategory(category)
    updateTaskTargetDate(taskToReassign.id, newTargetDate)
  }

  const dueOptions: { label: string; category: "today" | "tomorrow" | "next3days" }[] = [
    { label: `Today (${formatDateForDisplay(getTargetDateForCategory("today"))})`, category: "today" },
    { label: `Tomorrow (${formatDateForDisplay(getTargetDateForCategory("tomorrow"))})`, category: "tomorrow" },
    {
      label: `Next 3 Days (e.g. ${formatDateForDisplay(getTargetDateForCategory("next3days"))})`,
      category: "next3days",
    },
  ]

  return (
    <Dialog open={!!taskToReassign} onOpenChange={(isOpen) => !isOpen && closeReassignModal()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reassign Task</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4 text-sm text-neutral-600 truncate">
            Task: <span className="font-medium text-neutral-800">{taskToReassign.text}</span>
          </p>
          <div className="space-y-2">
            {dueOptions.map((option) => (
              <Button
                key={option.category}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleReassign(option.category)}
              >
                Move to {option.label}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DueDateReassignModal
