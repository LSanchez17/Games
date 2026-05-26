import { useCallback, useEffect, useState } from 'react'

/**
 * Tracks elapsed seconds. The timer only ticks while `isActive` is true.
 * Call `reset()` to set the counter back to zero (e.g. on level restart).
 */
export function useElapsedTimer(isActive: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isActive])

  const reset = useCallback(() => {
    setElapsedSeconds(0)
  }, [])

  return { elapsedSeconds, reset }
}
