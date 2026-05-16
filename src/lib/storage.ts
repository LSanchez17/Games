import type { ProgressData } from '@/lib/types'

const STORAGE_KEY = 'mahjong-progress-v1'

const defaultProgress: ProgressData = {
  unlockedLevel: 1,
  completedLevels: [],
  bestTimes: {},
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultProgress
    }

    const parsed = JSON.parse(raw) as Partial<ProgressData>

    return {
      unlockedLevel: Math.max(1, Number(parsed.unlockedLevel ?? 1)),
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels.filter((value): value is number => Number.isInteger(value) && value > 0)
        : [],
      bestTimes: typeof parsed.bestTimes === 'object' && parsed.bestTimes !== null
        ? Object.fromEntries(
            Object.entries(parsed.bestTimes).filter(
              ([key, value]) => Number.isInteger(Number(key)) && Number.isFinite(value as number),
            ),
          ) as Record<number, number>
        : {},
    }
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}
