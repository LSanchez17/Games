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
}

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}
