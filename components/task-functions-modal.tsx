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
  const {
    taskForFunctions,
    closeTaskFunctionsModal,
    updateTaskTargetDate,
    updateTaskDetails,
    effectiveDate,
    notificationPermission, // Get current permission status
    requestNotificationPermission, // Get function to request permission
  } = useTasks()
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
    // updateTaskTargetDate already closes the modal
  }

  const handleSaveAlarm = async () => {
    if (!selectedAlarmTime) {
      // If clearing alarm by setting empty time, just update
      updateTaskDetails(taskForFunctions.id, { alarmTime: null })
      closeTaskFunctionsModal()
      return
    }

    let currentPermission = notificationPermission
    if (typeof window !== "undefined" && "Notification" in window) {
      currentPermission = Notification.permission // Get the most up-to-date permission
    }

    if (currentPermission === "default") {
      const permissionResult = await requestNotificationPermission()
      if (permissionResult !== "granted") {
        // User denied or dismissed, still save alarm time but they won't get a notification
        updateTaskDetails(taskForFunctions.id, { alarmTime: selectedAlarmTime })
        closeTaskFunctionsModal()
        return
      }
    } else if (currentPermission === "denied") {
      alert(
        "Notifications are disabled. Please enable them in browser settings for alarms to work. Alarm time will be saved.",
      )
    }

    updateTaskDetails(taskForFunctions.id, { alarmTime: selectedAlarmTime })
    closeTaskFunctionsModal()
  }

  const handleClearAlarm = () => {
    updateTaskDetails(taskForFunctions.id, { alarmTime: null })
    setSelectedAlarmTime("")
    // Optionally close modal or keep it open if user might want to set a new time
    // closeTaskFunctionsModal(); // Let's keep it open for now
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
              <Button
                onClick={handleSaveAlarm}
                disabled={!selectedAlarmTime && !taskForFunctions.alarmTime}
                className="shrink-0"
              >
                {selectedAlarmTime ? "Set" : "Save"}
              </Button>
              <Button
                onClick={handleClearAlarm}
                variant="outline"
                disabled={!taskForFunctions.alarmTime && !selectedAlarmTime}
                className="shrink-0"
              >
                Clear
              </Button>
            </div>
            {taskForFunctions.alarmTime && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center sm:text-left">
                Current alarm: {taskForFunctions.alarmTime}
              </p>
            )}
            {notificationPermission === "denied" && (
              <p className="text-xs text-red-500 mt-2">
                Notifications are disabled in your browser settings. Alarms won't be shown.
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
