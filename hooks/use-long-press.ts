"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

interface LongPressOptions {
  shouldPreventDefault?: boolean
  delay?: number
  moveThreshold?: number // New: pixels before cancelling long press
}

export const useLongPress = (
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void,
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void,
  { shouldPreventDefault = true, delay = 300, moveThreshold = 10 }: LongPressOptions = {}, // Default moveThreshold
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()
  const startCoords = useRef<{ x: number; y: number } | null>(null) // New: to track initial touch/mouse position

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, { passive: false })
        target.current = event.target
      }

      // Store initial coordinates
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX
      const clientY = "touches" in event ? event.touches[0].clientY : event.clientY
      startCoords.current = { x: clientX, y: clientY }

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

      // Only trigger click if long press wasn't triggered AND no significant movement occurred
      const moved =
        startCoords.current &&
        (Math.abs(
          ("changedTouches" in event ? event.changedTouches[0].clientX : event.clientX) - startCoords.current.x,
        ) > moveThreshold ||
          Math.abs(
            ("changedTouches" in event ? event.changedTouches[0].clientY : event.clientY) - startCoords.current.y,
          ) > moveThreshold)

      if (shouldTriggerClick && !longPressTriggered && !moved) {
        onClick?.(event)
      }

      setLongPressTriggered(false)
      startCoords.current = null // Reset coordinates
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault)
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered, moveThreshold],
  )

  // New: Handler for touch/mouse move to cancel long press if movement occurs
  const handleMove = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (timeout.current && startCoords.current) {
        const clientX = "touches" in event ? event.touches[0].clientX : event.clientX
        const clientY = "touches" in event ? event.touches[0].clientY : event.clientY

        const deltaX = Math.abs(clientX - startCoords.current.x)
        const deltaY = Math.abs(clientY - startCoords.current.y)

        if (deltaX > moveThreshold || deltaY > moveThreshold) {
          clearTimeout(timeout.current)
          setLongPressTriggered(false) // Ensure long press is not triggered
          startCoords.current = null // Reset coordinates
        }
      }
    },
    [moveThreshold],
  )

  const preventDefault = (event: Event) => {
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
    // New: Add move handlers
    onMouseMove: (e: React.MouseEvent) => handleMove(e),
    onTouchMove: (e: React.TouchEvent) => handleMove(e),
  }
}
