import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Today - Minimalist To-Do",
  description: "Focus on what matters right now.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no", // For mobile-first UX
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("h-full", GeistSans.variable)} suppressHydrationWarning>
      <body className="h-full font-sans">{children}</body>
    </html>
  )
}
