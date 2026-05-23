import type { Difficulty, TimeBonusTier } from '@/lib/types'

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
