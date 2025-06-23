"use client"

import { useCallback, useRef, type MouseEvent, type TouchEvent } from "react"

const defaultOptions = {
  shouldPreventDefault: true,
  delay: 300,
  moveThreshold: 10, // Cancel long press if pointer moves more than 10px
}

type LongPressEvent<T> = MouseEvent<T> | TouchEvent<T>

export const useLongPress = <T extends HTMLElement>(
  onLongPress: (event: LongPressEvent<T>) => void,
  onClick?: (event: LongPressEvent<T>) => void,
  options: Partial<typeof defaultOptions> = {},
) => {
  const { shouldPreventDefault, delay, moveThreshold } = { ...defaultOptions, ...options }

  const timeoutRef = useRef<NodeJS.Timeout>()
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null)
  const isLongPressTriggeredRef = useRef(false)
  const hasMovedBeyondThresholdRef = useRef(false)
  const isPressedRef = useRef(false)

  const start = useCallback(
    (event: LongPressEvent<T>) => {
      if (isPressedRef.current) return // Already handling a press

      isPressedRef.current = true
      isLongPressTriggeredRef.current = false
      hasMovedBeyondThresholdRef.current = false

      const { clientX, clientY } = "touches" in event ? event.touches[0] : event
      startCoordsRef.current = { x: clientX, y: clientY }

      timeoutRef.current = setTimeout(() => {
        // Only trigger long press if not cancelled by movement
        if (!hasMovedBeyondThresholdRef.current && isPressedRef.current) {
          onLongPress(event)
          isLongPressTriggeredRef.current = true
        }
      }, delay)
    },
    [onLongPress, delay],
  )

  const cancel = useCallback((event?: LongPressEvent<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // If event is provided and it's a 'leave' event, don't reset isPressedRef
    // This allows long press to continue if mouse leaves and re-enters quickly
    // For touch, 'cancel' implies the gesture is over.
    if (!event || event.type !== "mouseleave") {
      isPressedRef.current = false
    }
  }, [])

  const handleMove = useCallback(
    (event: LongPressEvent<T>) => {
      if (!isPressedRef.current || !startCoordsRef.current || hasMovedBeyondThresholdRef.current) {
        return
      }

      const { clientX, clientY } = "touches" in event ? event.touches[0] : event
      const deltaX = Math.abs(clientX - startCoordsRef.current.x)
      const deltaY = Math.abs(clientY - startCoordsRef.current.y)

      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        hasMovedBeyondThresholdRef.current = true
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    },
    [moveThreshold],
  )

  const end = useCallback(
    (event: LongPressEvent<T>) => {
      if (!isPressedRef.current) return

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (shouldPreventDefault && isLongPressTriggeredRef.current) {
        event.preventDefault()
      }

      // Trigger onClick only if it wasn't a long press and no significant movement occurred
      if (onClick && !isLongPressTriggeredRef.current && !hasMovedBeyondThresholdRef.current) {
        onClick(event)
      }

      isPressedRef.current = false
      isLongPressTriggeredRef.current = false
      hasMovedBeyondThresholdRef.current = false
      startCoordsRef.current = null
    },
    [onClick, shouldPreventDefault],
  )

  const handleMouseLeave = useCallback((event: MouseEvent<T>) => {
    // A common pattern is to cancel long press if mouse leaves the element
    // but not necessarily end the "pressed" state immediately,
    // allowing for slight out-of-bounds movement.
    // For simplicity here, we'll just clear the timeout.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // If you want to fully cancel the press on mouse leave:
    // if (isPressedRef.current) {
    //   end(event);
    // }
  }, [])

  return {
    onMouseDown: start as (e: MouseEvent<T>) => void,
    onTouchStart: start as (e: TouchEvent<T>) => void,
    onMouseUp: end as (e: MouseEvent<T>) => void,
    onTouchEnd: end as (e: TouchEvent<T>) => void,
    onMouseMove: handleMove as (e: MouseEvent<T>) => void,
    onTouchMove: handleMove as (e: TouchEvent<T>) => void,
    onMouseLeave: handleMouseLeave, // Changed from `cancel` to `handleMouseLeave` for more specific logic if needed
    onTouchCancel: end as (e: TouchEvent<T>) => void, // Handle touch cancel events
  }
}
