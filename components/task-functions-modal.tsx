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
    notificationPermission,
    requestNotificationPermission,
  } = useTasks()
  const [selectedAlarmTime, setSelectedAlarmTime] = useState<string>("")

  useEffect(() => {
    if (taskForFunctions) {
      setSelectedAlarmTime(taskForFunctions.alarmTime || "")
    } else {
      setSelectedAlarmTime("")
    }
  }, [taskForFunctions])

  if (!taskForFunctions) return null

  const handleReassign = (category: "today" | "tomorrow" | "next3days") => {
    const newTargetDate = getTargetDateForCategory(category, effectiveDate)
    updateTaskTargetDate(taskForFunctions.id, newTargetDate)
  }

  const handleSaveAlarm = async () => {
    console.log(
      `[TaskFunctionsModal] handleSaveAlarm called. Selected time: "${selectedAlarmTime}" for task: "${taskForFunctions.text}"`,
    )

    if (!selectedAlarmTime && !taskForFunctions.alarmTime) {
      console.log("[TaskFunctionsModal] No new alarm time set and no existing alarm. Closing.")
      closeTaskFunctionsModal()
      return
    }

    let currentBrowserPermission = notificationPermission
    if (typeof window !== "undefined" && "Notification" in window) {
      currentBrowserPermission = Notification.permission // Get the most up-to-date permission directly from browser
      console.log("[TaskFunctionsModal] Current Notification.permission from browser:", currentBrowserPermission)
    }

    // Only request permission if a new alarm time is being set
    if (selectedAlarmTime && currentBrowserPermission === "default") {
      console.log("[TaskFunctionsModal] Permission is 'default', attempting to request...")
      const permissionResult = await requestNotificationPermission()
      console.log("[TaskFunctionsModal] Permission request result:", permissionResult)
      if (permissionResult !== "granted") {
        console.log(
          "[TaskFunctionsModal] Permission not granted after request. Alarm time will be saved, but no OS notification will occur.",
        )
        // Alert or inform user that notifications won't work but time is saved
        alert("Alarm time saved, but notifications won't show as permission was not granted.")
      }
    } else if (selectedAlarmTime && currentBrowserPermission === "denied") {
      console.log("[TaskFunctionsModal] Permission is 'denied'. Alerting user.")
      alert(
        "Notifications are disabled for this site. Please enable them in your browser settings for alarms to work. Alarm time will be saved.",
      )
    }

    console.log(
      `[TaskFunctionsModal] Updating task details with alarmTime: "${selectedAlarmTime || null}" for task ID: ${taskForFunctions.id}`,
    )
    updateTaskDetails(taskForFunctions.id, { alarmTime: selectedAlarmTime || null })
    closeTaskFunctionsModal()
  }

  const handleClearAlarm = () => {
    console.log(`[TaskFunctionsModal] handleClearAlarm called for task: "${taskForFunctions.text}"`)
    setSelectedAlarmTime("")
    // updateTaskDetails(taskForFunctions.id, { alarmTime: null }); // This will be handled by Save if user confirms
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
              <Button onClick={handleSaveAlarm} className="shrink-0">
                {selectedAlarmTime ? "Set Alarm" : taskForFunctions.alarmTime ? "Update Alarm" : "Save Time"}
              </Button>
              <Button
                onClick={handleClearAlarm}
                variant="outline"
                disabled={!selectedAlarmTime && !taskForFunctions.alarmTime}
                className="shrink-0"
              >
                Clear Time
              </Button>
            </div>
            {taskForFunctions.alarmTime && !selectedAlarmTime && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Current alarm set for: {taskForFunctions.alarmTime}
              </p>
            )}
            {selectedAlarmTime && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                New alarm time will be: {selectedAlarmTime} (Click "Set Alarm" to save)
              </p>
            )}
            {notificationPermission === "denied" && (
              <p className="text-xs text-red-500 mt-2">
                Browser notifications are disabled. Alarms will be saved but not shown.
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
