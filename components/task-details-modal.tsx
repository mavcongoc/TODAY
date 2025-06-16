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

  console.log("TaskDetailsModal render - taskForDetails:", taskForDetails) // Add this line

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <p className="text-sm text-neutral-500 truncate pt-1">{taskForDetails.text}</p>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="task-notes" className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this task..."
              rows={4}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Sub-tasks</h3>
            <div className="space-y-2 mb-3">
              {subTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
                  <Checkbox
                    id={`subtask-${subTask.id}`}
                    checked={subTask.completed}
                    onCheckedChange={() => handleToggleSubTask(subTask.id)}
                  />
                  <label
                    htmlFor={`subtask-${subTask.id}`}
                    className={`flex-grow text-sm ${subTask.completed ? "line-through text-neutral-500" : "text-neutral-800"}`}
                  >
                    {subTask.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubTask(subTask.id)}
                    aria-label="Delete sub-task"
                  >
                    <Trash2 size={16} className="text-neutral-500 hover:text-red-500" />
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
                className="flex-grow"
                onKeyPress={(e) => e.key === "Enter" && handleAddSubTask()}
              />
              <Button onClick={handleAddSubTask} size="icon" variant="outline" aria-label="Add sub-task">
                <PlusCircle size={20} />
              </Button>
            </div>
            {subTasks.length === 0 && <p className="text-xs text-neutral-400 mt-2">No sub-tasks yet.</p>}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailsModal
