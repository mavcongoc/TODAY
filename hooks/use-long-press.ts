"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

interface LongPressOptions {
  shouldPreventDefault?: boolean
  delay?: number
}

export const useLongPress = (
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void,
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void,
  { shouldPreventDefault = true, delay = 300 }: LongPressOptions = {},
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, { passive: false })
        target.current = event.target
      }
      timeout.current = setTimeout(() => {
        onLongPress(event)
        setLongPressTriggered(true)
      }, delay)
    },
    [onLongPress, delay, shouldPreventDefault],
  )

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current)
      shouldTriggerClick && !longPressTriggered && onClick?.(event)
      setLongPressTriggered(false)
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault)
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered],
  )

  const preventDefault = (event: Event) => {
    if (!longPressTriggered) {
      // If not a long press, it's a tap, don't prevent default for tap.
      // However, if it was a long press, we might want to prevent context menu etc.
      // This logic might need refinement based on desired tap behavior.
      // For now, if longPressTriggered, the default (e.g. context menu) is prevented by the nature of the interaction.
      // If not longPressTriggered, it's a click, so allow default.
      return
    }
    if (event.cancelable) {
      event.preventDefault()
    }
  }

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  }
}
