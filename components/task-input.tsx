"use client"

import type React from "react"
import { useState } from "react"
import { useTasks } from "@/contexts/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { getTargetDateForCategory } from "@/lib/date-utils"

const TaskInput: React.FC = () => {
  const [text, setText] = useState("")
  const { addTask } = useTasks()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      // New tasks default to "Today"
      addTask(text.trim(), getTargetDateForCategory("today"))
      setText("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-neutral-100 border-b border-neutral-200 sticky top-[73px] z-10">
      {" "}
      {/* Adjust top if ViewHeader height changes */}
      <div className="flex gap-2 max-w-md mx-auto">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task for Today..."
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
