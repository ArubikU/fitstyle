"use client"

import { useCallback } from "react"

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" | "selection" = "light") => {
    // Check if the device supports haptic feedback
    if ("vibrate" in navigator) {
      switch (type) {
        case "light":
          navigator.vibrate(10)
          break
        case "medium":
          navigator.vibrate(20)
          break
        case "heavy":
          navigator.vibrate(50)
          break
        case "selection":
          navigator.vibrate([10, 10, 10])
          break
        default:
          navigator.vibrate(10)
      }
    }
  }, [])

  return { triggerHaptic }
}
