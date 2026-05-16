import { describe, expect, it } from 'vitest'

import {
  TOTAL_LEVELS,
  createTilesForLevel,
  generateLevels,
  getFirstHint,
  hasAvailableMatch,
  isTileSelectable,
  shuffleUnmatchedTiles,
} from '@/lib/mahjong'
import type { LevelDefinition, Tile } from '@/lib/types'

describe('mahjong core logic', () => {
  it('generates 300 levels with expected difficulty ranges', () => {
    const levels = generateLevels()

    expect(levels).toHaveLength(TOTAL_LEVELS)
    expect(levels[0].difficulty).toBe('Easy')
    expect(levels[99].difficulty).toBe('Easy')
    expect(levels[100].difficulty).toBe('Medium')
    expect(levels[219].difficulty).toBe('Medium')
    expect(levels[220].difficulty).toBe('Hard')
  })

  it('creates paired tiles for a level', () => {
    const level: LevelDefinition = {
      id: 1,
      difficulty: 'Easy',
      rows: 4,
      cols: 6,
      timeTargetSeconds: 180,
      maxShuffles: 5,
    }

    const tiles = createTilesForLevel(level)
    const counts = tiles.reduce<Record<string, number>>((acc, tile) => {
      acc[tile.value] = (acc[tile.value] ?? 0) + 1
      return acc
    }, {})

    expect(tiles).toHaveLength(level.rows * level.cols)
    expect(Object.values(counts).every((count) => count === 2)).toBe(true)
  })

  it('respects tile selectability rules and hint availability', () => {
    const tiles: Tile[] = [
      { id: 1, value: '🀇', row: 0, col: 0, matched: false },
      { id: 2, value: '🀈', row: 0, col: 1, matched: false },
      { id: 3, value: '🀇', row: 0, col: 2, matched: false },
    ]

    expect(isTileSelectable(tiles, 1)).toBe(true)
    expect(isTileSelectable(tiles, 2)).toBe(false)
    expect(isTileSelectable(tiles, 3)).toBe(true)
    expect(hasAvailableMatch(tiles)).toBe(true)
    expect(getFirstHint(tiles)).toEqual([1, 3])
  })

  it('shuffles only unmatched tile values', () => {
    const tiles: Tile[] = [
      { id: 1, value: '🀇', row: 0, col: 0, matched: false },
      { id: 2, value: '🀈', row: 0, col: 1, matched: true },
      { id: 3, value: '🀉', row: 0, col: 2, matched: false },
      { id: 4, value: '🀊', row: 0, col: 3, matched: false },
    ]

    const shuffled = shuffleUnmatchedTiles(tiles, 999)
    const beforeUnmatched = tiles.filter((tile) => !tile.matched).map((tile) => tile.value).sort()
    const afterUnmatched = shuffled.filter((tile) => !tile.matched).map((tile) => tile.value).sort()

    expect(shuffled.find((tile) => tile.id === 2)?.value).toBe('🀈')
    expect(afterUnmatched).toEqual(beforeUnmatched)
  })
})
