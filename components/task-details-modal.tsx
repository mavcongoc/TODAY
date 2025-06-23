"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTasks } from "@/contexts/task-context"
import type { SubTask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Trash2 } from "lucide-react"

const TaskDetailsModal: React.FC = () => {
  const { taskForDetails, closeDetailsModal, updateTaskDetails } = useTasks()
  const [notes, setNotes] = useState("")
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [newSubTaskText, setNewSubTaskText] = useState("")

  useEffect(() => {
    if (taskForDetails) {
      setNotes(taskForDetails.notes || "")
      setSubTasks(taskForDetails.subTasks || [])
    } else {
      setNotes("")
      setSubTasks([])
    }
  }, [taskForDetails])

  if (!taskForDetails) {
    return null
  }

  const handleSave = () => {
    updateTaskDetails(taskForDetails.id, { notes, subTasks })
    closeDetailsModal()
  }

  const handleAddSubTask = () => {
    if (newSubTaskText.trim()) {
      setSubTasks([...subTasks, { id: crypto.randomUUID(), text: newSubTaskText.trim(), completed: false }])
      setNewSubTaskText("")
    }
  }

  const handleToggleSubTask = (subTaskId: string) => {
    setSubTasks(subTasks.map((st) => (st.id === subTaskId ? { ...st, completed: !st.completed } : st)))
  }

  const handleDeleteSubTask = (subTaskId: string) => {
    setSubTasks(subTasks.filter((st) => st.id !== subTaskId))
  }

  return (
    <Dialog open={!!taskForDetails} onOpenChange={(isOpen) => !isOpen && closeDetailsModal()}>
      {/*
        The DialogContent from shadcn/ui is already designed for centering.
        We ensure it doesn't exceed screen width on mobile by setting w-full
        and applying horizontal margins via padding on its direct child or using max-width.
        The `sm:max-w-lg` class handles larger screens.
        The `fixed left-[50%] top-[50%] ... translate-x-[-50%] translate-y-[-50%]` handles centering.
      */}
      <DialogContent className="p-0 w-[90vw] max-w-lg rounded-lg sm:w-full">
        <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6 text-left">
          <DialogTitle className="text-lg sm:text-xl">Task Details</DialogTitle>
          {taskForDetails && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate pt-1">{taskForDetails.text}</p>
          )}
        </DialogHeader>
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <div>
            <label
              htmlFor="task-notes"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Notes
            </label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this task..."
              rows={3}
              className="w-full focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sub-tasks</h3>
            <div className="space-y-2 mb-3">
              {subTasks.map((subTask) => (
                <div
                  key={subTask.id}
                  className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-md"
                >
                  <Checkbox
                    id={`subtask-${subTask.id}`}
                    checked={subTask.completed}
                    onCheckedChange={() => handleToggleSubTask(subTask.id)}
                    className="shrink-0"
                  />
                  <label
                    htmlFor={`subtask-${subTask.id}`}
                    className={`flex-grow text-sm ${subTask.completed ? "line-through text-neutral-500 dark:text-neutral-400" : "text-neutral-800 dark:text-neutral-100"}`}
                  >
                    {subTask.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubTask(subTask.id)}
                    aria-label="Delete sub-task"
                    className="shrink-0 h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Trash2 size={14} className="text-neutral-500 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newSubTaskText}
                onChange={(e) => setNewSubTaskText(e.target.value)}
                placeholder="Add a new sub-task"
                className="flex-grow w-full focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddSubTask()}
              />
              <Button
                onClick={handleAddSubTask}
                size="icon"
                variant="outline"
                aria-label="Add sub-task"
                className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
              >
                <PlusCircle size={18} />
              </Button>
            </div>
            {subTasks.length === 0 && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 text-center sm:text-left">
                No sub-tasks yet.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="w-full sm:w-auto">
            Save Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailsModal
