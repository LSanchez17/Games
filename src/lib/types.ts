export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type LevelDefinition = {
  id: number
  difficulty: Difficulty
  rows: number
  cols: number
  timeTargetSeconds: number
  maxShuffles: number
}

export type Tile = {
  id: number
  value: string
  row: number
  col: number
  matched: boolean
}

export type ProgressData = {
  unlockedLevel: number
  completedLevels: number[]
  bestTimes: Record<number, number>
  highScores: Record<number, number>
}

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type TimeBonusTier = {
  maxSeconds: number
  bonus: number
}

export type ScoreBreakdown = {
  base: number
  timeBonus: number
  noShuffleBonus: number
  total: number
}
