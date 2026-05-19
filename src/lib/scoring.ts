import { BASE_POINTS, NO_SHUFFLE_RETRY_BONUS, TIME_BONUS_TIERS } from '@/lib/constants'
import type { Difficulty, ScoreBreakdown } from '@/lib/types'

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
