"use client"

import { useCallback, useRef, type MouseEvent, type TouchEvent } from "react"

// Default options
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
  const timeout = useRef<NodeJS.Timeout>()
  const startCoords = useRef<{ x: number; y: number } | null>(null)
  const isLongPress = useRef(false)
  const isPressed = useRef(false)

  const start = useCallback(
    (event: LongPressEvent<T>) => {
      // Prevent multiple start triggers
      if (isPressed.current) return

      const { clientX, clientY } = "touches" in event ? event.touches[0] : event
      startCoords.current = { x: clientX, y: clientY }
      isPressed.current = true

      timeout.current = setTimeout(() => {
        onLongPress(event)
        isLongPress.current = true
      }, delay)
    },
    [onLongPress, delay],
  )

  const cancel = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    isPressed.current = false
    isLongPress.current = false
    startCoords.current = null
  }, [])

  const handleMove = useCallback(
    (event: LongPressEvent<T>) => {
      if (isPressed.current && startCoords.current) {
        const { clientX, clientY } = "touches" in event ? event.touches[0] : event
        const deltaX = Math.abs(clientX - startCoords.current.x)
        const deltaY = Math.abs(clientY - startCoords.current.y)

        if (deltaX > moveThreshold || deltaY > moveThreshold) {
          // Movement detected, cancel the long press
          cancel()
        }
      }
    },
    [moveThreshold, cancel],
  )

  const end = useCallback(
    (event: LongPressEvent<T>) => {
      if (isPressed.current) {
        if (shouldPreventDefault && isLongPress.current) {
          event.preventDefault()
        }

        if (onClick && !isLongPress.current) {
          onClick(event)
        }
      }
      cancel()
    },
    [onClick, shouldPreventDefault, cancel],
  )

  return {
    onMouseDown: start as (e: MouseEvent<T>) => void,
    onTouchStart: start as (e: TouchEvent<T>) => void,
    onMouseUp: end as (e: MouseEvent<T>) => void,
    onTouchEnd: end as (e: TouchEvent<T>) => void,
    onMouseMove: handleMove as (e: MouseEvent<T>) => void,
    onTouchMove: handleMove as (e: TouchEvent<T>) => void,
    onMouseLeave: cancel,
  }
}
