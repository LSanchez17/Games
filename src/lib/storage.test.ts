import { beforeEach, describe, expect, it } from 'vitest'

import { loadProgress, saveProgress } from '@/lib/storage'
import type { ProgressData } from '@/lib/types'

const storage: Record<string, string> = {}

function setupMockStorage() {
  const localStorageMock = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      Object.keys(storage).forEach((key) => {
        delete storage[key]
      })
    },
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: localStorageMock,
  })
}

describe('storage', () => {
  beforeEach(() => {
    setupMockStorage()
    globalThis.localStorage.clear()
  })

  it('returns default progress when nothing is saved', () => {
    expect(loadProgress()).toEqual({
      unlockedLevel: 1,
      completedLevels: [],
      bestTimes: {},
    })
  })

  it('saves and loads progress', () => {
    const progress: ProgressData = {
      unlockedLevel: 4,
      completedLevels: [1, 2, 3],
      bestTimes: { 3: 120 },
    }

    saveProgress(progress)

    expect(loadProgress()).toEqual(progress)
  })

  it('sanitizes malformed saved payloads', () => {
    globalThis.localStorage.setItem('mahjong-progress-v1', JSON.stringify({
      unlockedLevel: -10,
      completedLevels: [1, 'bad', 2],
      bestTimes: { foo: 10, 2: 90 },
    }))

    expect(loadProgress()).toEqual({
      unlockedLevel: 1,
      completedLevels: [1, 2],
      bestTimes: { 2: 90 },
    })
  })
})
