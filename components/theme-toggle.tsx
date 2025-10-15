"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Initialize from prefers or existing class
    const initial = document.documentElement.classList.contains("dark")
    setIsDark(initial)
  }, [])

  function toggle() {
    const root = document.documentElement
    root.classList.toggle("dark")
    setIsDark(root.classList.contains("dark"))
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-pressed={isDark} aria-label="Toggle theme">
      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
  )
}
