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

const TILE_SYMBOLS = [
  '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏',
  '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘',
  '🀙', '🀚', '🀛', '🀀', '🀁', '🀂', '🀃', '🀄', '🀅',
  '🀆', '🀢', '🀣', '🀤', '🀥', '🀦', '🀧', '🀨', '🀩',
]

export const TOTAL_LEVELS = 300

export function generateLevels(): LevelDefinition[] {
  return Array.from({ length: TOTAL_LEVELS }, (_, index) => {
    const id = index + 1

    if (id <= 100) {
      return {
        id,
        difficulty: 'Easy',
        rows: 4 + (id % 2),
        cols: 6,
        timeTargetSeconds: 180,
        maxShuffles: 5,
      }
    }

    if (id <= 220) {
      return {
        id,
        difficulty: 'Medium',
        rows: 6,
        cols: 6 + ((id + 1) % 2) * 2,
        timeTargetSeconds: 210,
        maxShuffles: 4,
      }
    }

    return {
      id,
      difficulty: 'Hard',
      rows: 8,
      cols: 8,
      timeTargetSeconds: 240,
      maxShuffles: 3,
    }
  })
}

export function createTilesForLevel(level: LevelDefinition): Tile[] {
  const tileCount = level.rows * level.cols
  const pairCount = tileCount / 2
  const symbolPool = Array.from({ length: pairCount }, (_, index) => TILE_SYMBOLS[index % TILE_SYMBOLS.length])
  const pairs = [...symbolPool, ...symbolPool]
  const shuffledValues = seededShuffle(pairs, level.id)

  const tiles: Tile[] = []
  let tileId = 1

  for (let row = 0; row < level.rows; row += 1) {
    for (let col = 0; col < level.cols; col += 1) {
      tiles.push({
        id: tileId,
        value: shuffledValues[tileId - 1],
        row,
        col,
        matched: false,
      })
      tileId += 1
    }
  }

  return tiles
}

export function isTileSelectable(tiles: Tile[], tileId: number): boolean {
  const tile = tiles.find((candidate) => candidate.id === tileId)
  if (!tile || tile.matched) {
    return false
  }

  const hasLeftNeighbor = tiles.some(
    (candidate) =>
      candidate.row === tile.row &&
      candidate.col === tile.col - 1 &&
      !candidate.matched,
  )

  const hasRightNeighbor = tiles.some(
    (candidate) =>
      candidate.row === tile.row &&
      candidate.col === tile.col + 1 &&
      !candidate.matched,
  )

  return !hasLeftNeighbor || !hasRightNeighbor
}

export function getFirstHint(tiles: Tile[]): [number, number] | null {
  const selectableTiles = tiles.filter((tile) => isTileSelectable(tiles, tile.id) && !tile.matched)

  for (let index = 0; index < selectableTiles.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < selectableTiles.length; compareIndex += 1) {
      if (selectableTiles[index].value === selectableTiles[compareIndex].value) {
        return [selectableTiles[index].id, selectableTiles[compareIndex].id]
      }
    }
  }

  return null
}

export function hasAvailableMatch(tiles: Tile[]): boolean {
  return getFirstHint(tiles) !== null
}

export function shuffleUnmatchedTiles(tiles: Tile[], seed: number): Tile[] {
  const unmatched = tiles.filter((tile) => !tile.matched)
  const shuffledValues = seededShuffle(unmatched.map((tile) => tile.value), seed)

  let valueIndex = 0

  return tiles.map((tile) => {
    if (tile.matched) {
      return tile
    }

    return {
      ...tile,
      value: shuffledValues[valueIndex++],
    }
  })
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed)
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let result = Math.imul(state ^ (state >>> 15), 1 | state)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}
