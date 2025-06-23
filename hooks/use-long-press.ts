"use client"

import { useCallback, useRef, type MouseEvent, type TouchEvent } from "react"

const defaultOptions = {
  shouldPreventDefault: true,
  delay: 500,
  moveThreshold: 5, // Very sensitive to catch any movement
}

type LongPressEvent<T> = MouseEvent<T> | TouchEvent<T>

export interface LongPressHandle {
  cancel: () => void
}

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
  const isCancelledExternallyRef = useRef(false)

  const cancel = useCallback(() => {
    console.log("Long press cancelled externally")
    isCancelledExternallyRef.current = true
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const start = useCallback(
    (event: LongPressEvent<T>) => {
      if (isPressedRef.current) return

      console.log("Long press started")
      isPressedRef.current = true
      isLongPressTriggeredRef.current = false
      hasMovedBeyondThresholdRef.current = false
      isCancelledExternallyRef.current = false

      const { clientX, clientY } = "touches" in event ? event.touches[0] : event
      startCoordsRef.current = { x: clientX, y: clientY }

      timeoutRef.current = setTimeout(() => {
        if (!hasMovedBeyondThresholdRef.current && !isCancelledExternallyRef.current && isPressedRef.current) {
          console.log("Long press triggered")
          onLongPress(event)
          isLongPressTriggeredRef.current = true
        } else {
          console.log("Long press timeout reached but cancelled:", {
            hasMoved: hasMovedBeyondThresholdRef.current,
            cancelledExternally: isCancelledExternallyRef.current,
            isPressed: isPressedRef.current,
          })
        }
      }, delay)
    },
    [onLongPress, delay],
  )

  const handleMove = useCallback(
    (event: LongPressEvent<T>) => {
      if (!isPressedRef.current || !startCoordsRef.current || hasMovedBeyondThresholdRef.current) {
        return
      }

      const { clientX, clientY } = "touches" in event ? event.touches[0] : event
      const deltaX = Math.abs(clientX - startCoordsRef.current.x)
      const deltaY = Math.abs(clientY - startCoordsRef.current.y)

      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        console.log("Movement detected, cancelling long press", { deltaX, deltaY, moveThreshold })
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

      console.log("Long press ended")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (shouldPreventDefault && isLongPressTriggeredRef.current) {
        event.preventDefault()
      }

      // Only trigger onClick if it wasn't a long press, no movement, and not cancelled externally
      if (
        onClick &&
        !isLongPressTriggeredRef.current &&
        !hasMovedBeyondThresholdRef.current &&
        !isCancelledExternallyRef.current
      ) {
        console.log("Click triggered")
        onClick(event)
      } else {
        console.log("Click blocked:", {
          isLongPress: isLongPressTriggeredRef.current,
          hasMoved: hasMovedBeyondThresholdRef.current,
          cancelledExternally: isCancelledExternallyRef.current,
        })
      }

      // Reset all state
      isPressedRef.current = false
      isLongPressTriggeredRef.current = false
      hasMovedBeyondThresholdRef.current = false
      isCancelledExternallyRef.current = false
      startCoordsRef.current = null
    },
    [onClick, shouldPreventDefault],
  )

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    handlers: {
      onMouseDown: start as (e: MouseEvent<T>) => void,
      onTouchStart: start as (e: TouchEvent<T>) => void,
      onMouseUp: end as (e: MouseEvent<T>) => void,
      onTouchEnd: end as (e: TouchEvent<T>) => void,
      onMouseMove: handleMove as (e: MouseEvent<T>) => void,
      onTouchMove: handleMove as (e: TouchEvent<T>) => void,
      onMouseLeave: handleMouseLeave,
      onTouchCancel: end as (e: TouchEvent<T>) => void,
    },
    cancel,
  }
}
