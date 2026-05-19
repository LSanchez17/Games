import type { Difficulty } from '@/lib/types'

export type ScoreBreakdown = {
  base: number
  timeBonus: number
  noShuffleBonus: number
  total: number
}

type TimeBonusTier = {
  maxSeconds: number
  bonus: number
}

export const BASE_POINTS: Record<Difficulty, number> = {
  Easy: 100,
  Medium: 200,
  Hard: 300,
}

export const TIME_BONUS_TIERS: Record<Difficulty, TimeBonusTier[]> = {
  Easy: [
    { maxSeconds: 60, bonus: 150 },
    { maxSeconds: 120, bonus: 75 },
    { maxSeconds: 180, bonus: 25 },
  ],
  Medium: [
    { maxSeconds: 90, bonus: 300 },
    { maxSeconds: 150, bonus: 150 },
    { maxSeconds: 210, bonus: 50 },
  ],
  Hard: [
    { maxSeconds: 120, bonus: 500 },
    { maxSeconds: 180, bonus: 250 },
    { maxSeconds: 240, bonus: 100 },
  ],
}

export const NO_SHUFFLE_RETRY_BONUS: Record<Difficulty, number> = {
  Easy: 50,
  Medium: 100,
  Hard: 150,
}

export function calculateScore(
  difficulty: Difficulty,
  elapsedSeconds: number,
  usedShuffleOrRetry: boolean,
): ScoreBreakdown {
  const base = BASE_POINTS[difficulty]
  const tiers = TIME_BONUS_TIERS[difficulty]
  const tier = tiers.find((t) => elapsedSeconds <= t.maxSeconds)
  const timeBonus = tier?.bonus ?? 0
  const noShuffleBonus = usedShuffleOrRetry ? 0 : NO_SHUFFLE_RETRY_BONUS[difficulty]

  return {
    base,
    timeBonus,
    noShuffleBonus,
    total: base + timeBonus + noShuffleBonus,
  }
}

export function getTotalPoints(highScores: Record<number, number>): number {
  return Object.values(highScores).reduce((sum, score) => sum + score, 0)
}
