"use client"

import type React from "react"
import { useState } from "react"
import { useTasks } from "@/contexts/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { getTargetDateForCategory } from "@/lib/date-utils"
import type { DueCategory } from "@/lib/types"

interface TaskInputProps {
  currentView: DueCategory
}

const viewDisplayNames: Record<DueCategory, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  next3days: "Next 3 Days",
}

const TaskInput: React.FC<TaskInputProps> = ({ currentView }) => {
  const [text, setText] = useState("")
  const { addTask, effectiveDate } = useTasks() // Get effectiveDate from context

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      // Use currentView and effectiveDate to determine the targetDate
      const targetDate = getTargetDateForCategory(currentView, effectiveDate)
      addTask(text.trim(), targetDate)
      setText("")
    }
  }

  const placeholderText = `Add a new task for ${viewDisplayNames[currentView]}...`

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-neutral-100 border-b border-neutral-200 sticky top-[73px] z-10">
      {" "}
      {/* Adjust top if ViewHeader height changes */}
      <div className="flex gap-2 max-w-md mx-auto">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderText}
          className="flex-grow text-base bg-white"
          aria-label="New task"
        />
        <Button type="submit" size="icon" aria-label="Add task">
          <Plus size={20} />
        </Button>
      </div>
    </form>
  )
}

export default TaskInput
