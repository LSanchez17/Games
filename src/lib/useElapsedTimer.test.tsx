// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useElapsedTimer } from './useElapsedTimer'

describe('useElapsedTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('increments elapsed seconds every second when active', () => {
    const { result } = renderHook(() => useElapsedTimer(true))

    act(() => { vi.advanceTimersByTime(3000) })

    expect(result.current.elapsedSeconds).toBe(3)
  })

  it('does not increment elapsed seconds when inactive', () => {
    const { result } = renderHook(() => useElapsedTimer(false))

    act(() => { vi.advanceTimersByTime(5000) })

    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('stops incrementing when isActive changes from true to false', () => {
    let isActive = true
    const { result, rerender } = renderHook(() => useElapsedTimer(isActive))

    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.elapsedSeconds).toBe(3)

    isActive = false
    rerender()

    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.elapsedSeconds).toBe(3)
  })

  it('resumes incrementing when isActive changes from false to true', () => {
    let isActive = false
    const { result, rerender } = renderHook(() => useElapsedTimer(isActive))

    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.elapsedSeconds).toBe(0)

    isActive = true
    rerender()

    act(() => { vi.advanceTimersByTime(4000) })
    expect(result.current.elapsedSeconds).toBe(4)
  })

  it('reset() sets elapsed seconds back to zero', () => {
    const { result } = renderHook(() => useElapsedTimer(true))

    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.elapsedSeconds).toBe(5)

    act(() => { result.current.reset() })
    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('timer continues running after reset() while still active', () => {
    const { result } = renderHook(() => useElapsedTimer(true))

    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { result.current.reset() })

    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.elapsedSeconds).toBe(2)
  })
})
