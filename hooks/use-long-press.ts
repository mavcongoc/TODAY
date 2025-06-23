"use client"

import { useCallback, useRef, type MouseEvent, type TouchEvent } from "react"

const defaultOptions = {
  shouldPreventDefault: true,
  delay: 500,
  moveThreshold: 8, // More sensitive to catch swipes earlier
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
      if (isPressedRef.current) return

      isPressedRef.current = true
      isLongPressTriggeredRef.current = false
      hasMovedBeyondThresholdRef.current = false

      const { clientX, clientY } = "touches" in event ? event.touches[0] : event
      startCoordsRef.current = { x: clientX, y: clientY }

      timeoutRef.current = setTimeout(() => {
        if (!hasMovedBeyondThresholdRef.current && isPressedRef.current) {
          console.log("Long press triggered")
          onLongPress(event)
          isLongPressTriggeredRef.current = true
        }
      }, delay)
    },
    [onLongPress, delay],
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    isPressedRef.current = false
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

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (shouldPreventDefault && isLongPressTriggeredRef.current) {
        event.preventDefault()
      }

      // Only trigger onClick if it wasn't a long press and no significant movement occurred
      if (onClick && !isLongPressTriggeredRef.current && !hasMovedBeyondThresholdRef.current) {
        console.log("Click triggered")
        onClick(event)
      } else {
        console.log("Click blocked:", {
          isLongPress: isLongPressTriggeredRef.current,
          hasMoved: hasMovedBeyondThresholdRef.current,
        })
      }

      isPressedRef.current = false
      isLongPressTriggeredRef.current = false
      hasMovedBeyondThresholdRef.current = false
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
    onMouseDown: start as (e: MouseEvent<T>) => void,
    onTouchStart: start as (e: TouchEvent<T>) => void,
    onMouseUp: end as (e: MouseEvent<T>) => void,
    onTouchEnd: end as (e: TouchEvent<T>) => void,
    onMouseMove: handleMove as (e: MouseEvent<T>) => void,
    onTouchMove: handleMove as (e: TouchEvent<T>) => void,
    onMouseLeave: handleMouseLeave,
    onTouchCancel: end as (e: TouchEvent<T>) => void,
  }
}
