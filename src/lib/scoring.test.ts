import { describe, expect, it } from 'vitest'

import {
  BASE_POINTS,
  NO_SHUFFLE_RETRY_BONUS,
  TIME_BONUS_TIERS,
  calculateScore,
  getTotalPoints,
} from '@/lib/scoring'

describe('calculateScore', () => {
  it('returns base points + max time bonus + clean bonus for a fast clean run', () => {
    const score = calculateScore('Easy', 30, false)

    expect(score.base).toBe(BASE_POINTS.Easy)
    expect(score.timeBonus).toBe(TIME_BONUS_TIERS.Easy[0].bonus)
    expect(score.noShuffleBonus).toBe(NO_SHUFFLE_RETRY_BONUS.Easy)
    expect(score.total).toBe(score.base + score.timeBonus + score.noShuffleBonus)
  })

  it('awards mid-tier time bonus for a moderately fast run', () => {
    const score = calculateScore('Easy', 100, false)

    expect(score.timeBonus).toBe(TIME_BONUS_TIERS.Easy[1].bonus)
  })

  it('awards lowest time bonus tier at the time target boundary', () => {
    const score = calculateScore('Easy', 180, false)

    expect(score.timeBonus).toBe(TIME_BONUS_TIERS.Easy[2].bonus)
  })

  it('awards no time bonus when elapsed time exceeds the target', () => {
    const score = calculateScore('Easy', 181, false)

    expect(score.timeBonus).toBe(0)
  })

  it('awards no clean bonus when shuffle or retry was used', () => {
    const score = calculateScore('Medium', 50, true)

    expect(score.noShuffleBonus).toBe(0)
    expect(score.total).toBe(score.base + score.timeBonus)
  })

  it('calculates correct totals for Medium difficulty', () => {
    const score = calculateScore('Medium', 80, false)

    expect(score.base).toBe(BASE_POINTS.Medium)
    expect(score.timeBonus).toBe(TIME_BONUS_TIERS.Medium[0].bonus)
    expect(score.noShuffleBonus).toBe(NO_SHUFFLE_RETRY_BONUS.Medium)
    expect(score.total).toBe(score.base + score.timeBonus + score.noShuffleBonus)
  })

  it('calculates correct totals for Hard difficulty', () => {
    const score = calculateScore('Hard', 100, false)

    expect(score.base).toBe(BASE_POINTS.Hard)
    expect(score.timeBonus).toBe(TIME_BONUS_TIERS.Hard[0].bonus)
    expect(score.noShuffleBonus).toBe(NO_SHUFFLE_RETRY_BONUS.Hard)
    expect(score.total).toBe(score.base + score.timeBonus + score.noShuffleBonus)
  })

  it('total is always at least the base points', () => {
    const score = calculateScore('Hard', 9999, true)

    expect(score.total).toBe(BASE_POINTS.Hard)
    expect(score.timeBonus).toBe(0)
    expect(score.noShuffleBonus).toBe(0)
  })
})

describe('getTotalPoints', () => {
  it('returns 0 for empty high scores', () => {
    expect(getTotalPoints({})).toBe(0)
  })

  it('sums all per-level high scores', () => {
    expect(getTotalPoints({ 1: 300, 2: 450, 3: 200 })).toBe(950)
  })
})
