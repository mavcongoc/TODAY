"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

interface LongPressOptions {
  shouldPreventDefault?: boolean
  delay?: number
  moveThreshold?: number // Pixels before cancelling long press
  cancelCondition?: boolean // NEW: Condition to cancel long press (e.g., if a swipe is active)
}

export const useLongPress = (
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void,
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void,
  { shouldPreventDefault = true, delay = 300, moveThreshold = 10, cancelCondition = false }: LongPressOptions = {},
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()
  const startCoords = useRef<{ x: number; y: number } | null>(null)

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

      // Only set timeout if not already cancelled by condition
      if (!cancelCondition) {
        // CRITICAL CHECK: Don't start long press if already cancelled
        timeout.current = setTimeout(() => {
          // Double check cancelCondition here too, in case it changed just before timeout fires
          if (!cancelCondition) {
            // CRITICAL CHECK: Don't fire if condition became true
            onLongPress(event)
            setLongPressTriggered(true)
          } else {
            console.log("Long press cancelled by condition before timeout fired.")
          }
        }, delay)
      } else {
        console.log("Long press start prevented by condition.")
      }
    },
    [onLongPress, delay, shouldPreventDefault, cancelCondition], // Add cancelCondition to dependencies
  )

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current)

      // Check if significant movement occurred
      const moved =
        startCoords.current &&
        (Math.abs(
          ("changedTouches" in event ? event.changedTouches[0].clientX : event.clientX) - startCoords.current.x,
        ) > moveThreshold ||
          Math.abs(
            ("changedTouches" in event ? event.changedTouches[0].clientY : event.clientY) - startCoords.current.y,
          ) > moveThreshold)

      // Only trigger click if long press wasn't triggered AND no significant movement occurred
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

  // Handler for touch/mouse move to cancel long press if movement occurs
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
          console.log("Long press cancelled due to movement.")
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
    onMouseMove: (e: React.MouseEvent) => handleMove(e),
    onTouchMove: (e: React.TouchEvent) => handleMove(e),
  }
}
