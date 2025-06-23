import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox" // For task completion
import { Label } from "@/components/ui/label" // For associating with checkbox

interface TaskViewProps {
  title: string
  isActive: boolean
}

// Placeholder task structure - in a real app, this would come from state management
interface Task {
  id: string
  text: string
  completed: boolean
}

const placeholderTasksData: Record<string, Task[]> = {
  Today: [
    { id: "t1", text: "Morning meditation", completed: false },
    { id: "t2", text: "Team stand-up meeting", completed: true },
    { id: "t3", text: "Work on 'TODAY' app UI", completed: false },
    { id: "t4", text: "Lunch break", completed: false },
    { id: "t5", text: "Review user feedback", completed: false },
    { id: "t6", text: "Evening workout", completed: false },
  ],
  Tomorrow: [
    { id: "tm1", text: "Plan sprint goals", completed: false },
    { id: "tm2", text: "Client call at 2 PM", completed: false },
    { id: "tm3", text: "Grocery shopping", completed: false },
  ],
  "Next 3 Days": [
    { id: "n1", text: "Prepare weekend trip", completed: false },
    { id: "n2", text: "Read industry news", completed: false },
    { id: "n3", text: "Book dentist appointment", completed: false },
  ],
}

export default function TaskView({ title }: TaskViewProps) {
  // In a real app, tasks would be fetched or come from a global/local state.
  // For now, we use placeholder data.
  const tasks = placeholderTasksData[title] || []

  // TODO: Implement task completion logic

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 p-4 pt-6 md:p-6 md:pt-8">
      <h2 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">{title}</h2>
      <ScrollArea className="flex-grow pr-2">
        {" "}
        {/* pr-2 to give scrollbar some space if visible */}
        {tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                  ${
                    task.completed
                      ? "bg-neutral-100 dark:bg-neutral-800 opacity-70"
                      : "bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  // onCheckedChange={() => handleToggleComplete(task.id)} // TODO: Implement
                  aria-labelledby={`task-label-${task.id}`}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 dark:data-[state=checked]:bg-green-500 dark:data-[state=checked]:border-green-500"
                />
                <Label
                  htmlFor={`task-${task.id}`}
                  id={`task-label-${task.id}`}
                  className={`flex-grow text-sm font-medium ${task.completed ? "line-through text-neutral-500 dark:text-neutral-400" : "text-neutral-700 dark:text-neutral-200"}`}
                >
                  {task.text}
                </Label>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 dark:text-neutral-400">
            <div className="mb-4">
              {/* You can use a relevant icon here */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="text-lg font-medium">All clear for {title}!</p>
            <p className="text-sm">Add a new task using the input below.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
