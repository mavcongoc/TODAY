import { format, addDays, startOfDay, isSameDay, isBefore, parseISO } from "date-fns"

export const getTodayDateString = (): string => format(startOfDay(new Date()), "yyyy-MM-dd")

// Removed getTomorrowDateString and getDayAfterTomorrowDateString as they are covered by getTargetDateForCategory

export const getTargetDateForCategory = (
  category: "today" | "tomorrow" | "next3days",
  baseDateString?: string, // Optional: base date to calculate from, defaults to actual today
): string => {
  const baseDate = baseDateString ? startOfDay(parseISO(baseDateString)) : startOfDay(new Date())

  if (category === "today") return format(baseDate, "yyyy-MM-dd")
  if (category === "tomorrow") return format(addDays(baseDate, 1), "yyyy-MM-dd")
  // For 'next3days', default to two days from the baseDate
  return format(addDays(baseDate, 2), "yyyy-MM-dd")
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
