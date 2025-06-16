"use client"

import type React from "react"
import { useTasks } from "@/contexts/task-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const DeleteConfirmationDialog: React.FC = () => {
  const { taskToDeleteId, closeDeleteConfirm, deleteTask, tasks } = useTasks()

  console.log("DeleteConfirmationDialog render - taskToDeleteId:", taskToDeleteId) // Add this line

  const task = tasks.find((t) => t.id === taskToDeleteId)

  const handleDelete = () => {
    if (taskToDeleteId) {
      deleteTask(taskToDeleteId)
    }
  }

  return (
    <AlertDialog open={!!taskToDeleteId} onOpenChange={(isOpen) => !isOpen && closeDeleteConfirm()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task:
            <br />
            <strong className="truncate block mt-1">{task?.text || "Selected task"}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDeleteConfirm}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteConfirmationDialog
