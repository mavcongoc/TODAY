"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTasks } from "@/contexts/task-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getTargetDateForCategory, formatDateForDisplay } from "@/lib/date-utils"
import type { DueCategory } from "@/lib/types"
import { Clock, CalendarDays } from "lucide-react"

const TaskFunctionsModal: React.FC = () => {
  const { taskForFunctions, closeTaskFunctionsModal, updateTaskTargetDate, updateTaskDetails, effectiveDate } =
    useTasks()
  const [selectedAlarmTime, setSelectedAlarmTime] = useState<string>("")

  useEffect(() => {
    if (taskForFunctions) {
      setSelectedAlarmTime(taskForFunctions.alarmTime || "")
    } else {
      setSelectedAlarmTime("")
    }
  }, [taskForFunctions])

  if (!taskForFunctions) {
    return null
  }

  const handleReassign = (category: "today" | "tomorrow" | "next3days") => {
    const newTargetDate = getTargetDateForCategory(category, effectiveDate)
    updateTaskTargetDate(taskForFunctions.id, newTargetDate)
    // No need to close here, updateTaskTargetDate already closes the modal
  }

  const handleSaveAlarm = () => {
    updateTaskDetails(taskForFunctions.id, { alarmTime: selectedAlarmTime || null })
    closeTaskFunctionsModal()
  }

  const handleClearAlarm = () => {
    updateTaskDetails(taskForFunctions.id, { alarmTime: null })
    setSelectedAlarmTime("")
    closeTaskFunctionsModal()
  }

  const dueOptions: { label: string; category: DueCategory }[] = [
    { label: `Today (${formatDateForDisplay(getTargetDateForCategory("today", effectiveDate))})`, category: "today" },
    {
      label: `Tomorrow (${formatDateForDisplay(getTargetDateForCategory("tomorrow", effectiveDate))})`,
      category: "tomorrow",
    },
    {
      label: `Next 3 Days (e.g. ${formatDateForDisplay(getTargetDateForCategory("next3days", effectiveDate))})`,
      category: "next3days",
    },
  ]

  return (
    <Dialog open={!!taskForFunctions} onOpenChange={(isOpen) => !isOpen && closeTaskFunctionsModal()}>
      <DialogContent className="p-0 w-[90vw] max-w-lg rounded-lg sm:w-full">
        <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6 text-left">
          <DialogTitle className="text-lg sm:text-xl">Task Functions</DialogTitle>
          {taskForFunctions && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate pt-1">{taskForFunctions.text}</p>
          )}
        </DialogHeader>
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          {/* Due Date Reassignment Section */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
              <CalendarDays size={16} /> Reassign Due Date
            </h3>
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

          {/* Alarm Section */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
              <Clock size={16} /> Set Alarm
            </h3>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={selectedAlarmTime}
                onChange={(e) => setSelectedAlarmTime(e.target.value)}
                className="flex-grow"
                aria-label="Set alarm time"
              />
              <Button onClick={handleSaveAlarm} disabled={!selectedAlarmTime} className="shrink-0">
                Set
              </Button>
              <Button
                onClick={handleClearAlarm}
                variant="outline"
                disabled={!taskForFunctions.alarmTime}
                className="shrink-0"
              >
                Clear
              </Button>
            </div>
            {taskForFunctions.alarmTime && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center sm:text-left">
                Alarm set for {taskForFunctions.alarmTime}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskFunctionsModal
