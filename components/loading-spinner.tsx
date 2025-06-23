"use client"

import type React from "react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
        <p className="text-neutral-500 text-sm">Loading your tasks...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
