import { format, addDays, startOfDay, isSameDay, isBefore, parseISO } from "date-fns"

export const getTodayDateString = (): string => format(startOfDay(new Date()), "yyyy-MM-dd")

export const getTomorrowDateString = (): string => format(addDays(startOfDay(new Date()), 1), "yyyy-MM-dd")

export const getDayAfterTomorrowDateString = (): string => format(addDays(startOfDay(new Date()), 2), "yyyy-MM-dd")

export const getTargetDateForCategory = (category: "today" | "tomorrow" | "next3days"): string => {
  if (category === "today") return getTodayDateString()
  if (category === "tomorrow") return getTomorrowDateString()
  // For 'next3days', default to day after tomorrow when adding a new task initially
  return getDayAfterTomorrowDateString()
}

export const getDueCategory = (
  targetDateString: string,
  currentDateString: string,
): "today" | "tomorrow" | "next3days" => {
  const taskTargetDate = startOfDay(parseISO(targetDateString))
  const currentEffectiveDate = startOfDay(parseISO(currentDateString))

  // If task is overdue or due today
  if (isBefore(taskTargetDate, currentEffectiveDate) || isSameDay(taskTargetDate, currentEffectiveDate)) {
    return "today"
  }
  // If task is due tomorrow
  if (isSameDay(taskTargetDate, addDays(currentEffectiveDate, 1))) {
    return "tomorrow"
  }
  // All other future tasks
  return "next3days"
}

export const formatDateForDisplay = (dateString: string): string => {
  return format(parseISO(dateString), "EEEE, MMM d")
}
