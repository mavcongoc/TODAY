"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import TaskView from "./task-view"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

const views = [
  { id: "today", title: "Today" },
  { id: "tomorrow", title: "Tomorrow" },
  { id: "next3days", title: "Next 3 Days" },
]

export default function TodayApp() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [currentViewIndex, setCurrentViewIndex] = React.useState(0)
  const [newTaskInputValue, setNewTaskInputValue] = React.useState("")

  React.useEffect(() => {
    if (!api) {
      return
    }
    setCurrentViewIndex(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrentViewIndex(api.selectedScrollSnap())
    })
  }, [api])

  const handleAddTask = () => {
    if (newTaskInputValue.trim() === "") return
    // In a real app, this would add the task to the appropriate list (Today, Tomorrow, etc.)
    // based on currentViewIndex or a global state.
    console.log(`Adding task: ${newTaskInputValue} to ${views[currentViewIndex]?.title}`)
    setNewTaskInputValue("") // Clear input
  }

  return (
    <div className="h-full flex flex-col">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false, // Typically, date progression is not looped
        }}
        className="flex-grow w-full" // Carousel takes up available vertical space
      >
        <CarouselContent className="-ml-0 h-full">
          {views.map((view, index) => (
            <CarouselItem key={view.id} className="basis-full p-0 h-full">
              <TaskView title={view.title} isActive={index === currentViewIndex} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Previous/Next buttons are hidden on extra-small screens (mobile-first) to prioritize swipe */}
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/80 dark:bg-black/80 text-neutral-900 dark:text-neutral-100 hover:bg-white dark:hover:bg-black" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/80 dark:bg-black/80 text-neutral-900 dark:text-neutral-100 hover:bg-white dark:hover:bg-black" />
      </Carousel>

      {/* Task Input Area - fixed at the bottom */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder={`Add a task for ${views[currentViewIndex]?.title}...`}
            value={newTaskInputValue}
            onChange={(e) => setNewTaskInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddTask()
              }
            }}
            className="flex-grow bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 dark:focus:ring-primary-400"
            aria-label="Add new task"
          />
          <Button
            onClick={handleAddTask}
            size="icon"
            className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
            aria-label="Add task"
          >
            <PlusIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
