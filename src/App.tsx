import { useEffect, useMemo, useState } from 'react'
import { Download, Lightbulb, Menu, Shuffle, Trophy, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  createTilesForLevel,
  generateLevels,
  getFirstHint,
  hasAvailableMatch,
  isTileSelectable,
  shuffleUnmatchedTiles,
} from '@/lib/mahjong'
import { loadProgress, saveProgress } from '@/lib/storage'
import type { InstallPromptEvent, ProgressData, Tile } from '@/lib/types'

const levels = generateLevels()
const selectedTileClasses =
  'scale-105 border-violet-700 bg-violet-200 text-violet-950 ring-4 ring-violet-500 ring-offset-2 ring-offset-slate-950 shadow-[0_0_0_2px_rgba(139,92,246,0.75)]'

function App() {
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress())
  const [selectedLevel, setSelectedLevel] = useState<number>(() =>
    Math.min(levels.length, Math.max(1, loadProgress().unlockedLevel)),
  )
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const initialLevelId = Math.min(levels.length, Math.max(1, loadProgress().unlockedLevel))
    const initialLevel = levels.find((entry) => entry.id === initialLevelId) ?? levels[0]
    return createTilesForLevel(initialLevel)
  })
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [shufflesRemaining, setShufflesRemaining] = useState(() => {
    const initialLevelId = Math.min(levels.length, Math.max(1, loadProgress().unlockedLevel))
    const initialLevel = levels.find((entry) => entry.id === initialLevelId) ?? levels[0]
    return initialLevel.maxShuffles
  })
  const [hintPair, setHintPair] = useState<[number, number] | null>(null)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const level = useMemo(() => levels.find((entry) => entry.id === selectedLevel) ?? levels[0], [selectedLevel])

  const completedCount = progress.completedLevels.length
  const completionPercent = (completedCount / levels.length) * 100
  const allMatched = tiles.every((tile) => tile.matched)

  function resetLevel(levelId: number) {
    const activeLevel = levels.find((entry) => entry.id === levelId) ?? levels[0]

    setTiles(createTilesForLevel(activeLevel))
    setSelectedTileId(null)
    setElapsedSeconds(0)
    setShufflesRemaining(activeLevel.maxShuffles)
    setHintPair(null)
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [level.id])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredInstallPrompt(event as InstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const availableMatch = hasAvailableMatch(tiles)

  const attemptInstall = async () => {
    if (!deferredInstallPrompt) {
      return
    }

    await deferredInstallPrompt.prompt()
    await deferredInstallPrompt.userChoice
    setDeferredInstallPrompt(null)
  }

  const handleTileClick = (tileId: number) => {
    if (allMatched || !isTileSelectable(tiles, tileId)) {
      return
    }

    setHintPair(null)

    if (!selectedTileId) {
      setSelectedTileId(tileId)
      return
    }

    if (selectedTileId === tileId) {
      setSelectedTileId(null)
      return
    }

    const firstTile = tiles.find((tile) => tile.id === selectedTileId)
    const secondTile = tiles.find((tile) => tile.id === tileId)

    if (!firstTile || !secondTile) {
      setSelectedTileId(null)
      return
    }

    if (firstTile.value === secondTile.value) {
      const updatedTiles = tiles.map((tile) =>
        tile.id === firstTile.id || tile.id === secondTile.id
          ? { ...tile, matched: true }
          : tile,
      )

      setTiles(updatedTiles)
      const levelCleared = updatedTiles.every((tile) => tile.matched)

      if (levelCleared) {
        setProgress((previous) => {
          const existingTime = previous.bestTimes[level.id]
          const bestTimes = {
            ...previous.bestTimes,
            [level.id]: existingTime ? Math.min(existingTime, elapsedSeconds) : elapsedSeconds,
          }

          const completedLevels = previous.completedLevels.includes(level.id)
            ? previous.completedLevels
            : [...previous.completedLevels, level.id].sort((a, b) => a - b)

          const nextLevel = Math.min(levels.length, Math.max(previous.unlockedLevel, level.id + 1))

          return {
            unlockedLevel: nextLevel,
            completedLevels,
            bestTimes,
          }
        })
      }

      setSelectedTileId(null)
      return
    }

    setSelectedTileId(tileId)
  }

  const showHint = () => {
    setHintPair(getFirstHint(tiles))
  }

  const handleLevelChange = (levelId: number) => {
    setSelectedLevel(levelId)
    resetLevel(levelId)
    setIsMobileMenuOpen(false)
  }

  const shuffle = () => {
    if (shufflesRemaining <= 0 || allMatched) {
      return
    }

    setTiles((previous) => shuffleUnmatchedTiles(previous, Date.now()))
    setSelectedTileId(null)
    setHintPair(null)
    setShufflesRemaining((value) => value - 1)
  }

  const controlsPanel = (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Mahjong Journey</CardTitle>
        <CardDescription>
          300 offline-ready levels with local progress and installable PWA support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Overall Progress</span>
            <span>{completedCount} / {levels.length}</span>
          </div>
          <Progress value={completionPercent} />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="level-select">Level</label>
          <select
            id="level-select"
            value={selectedLevel}
            onChange={(event) => handleLevelChange(Number(event.target.value))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm"
          >
            {levels.map((entry) => (
              <option
                key={entry.id}
                value={entry.id}
                disabled={entry.id > progress.unlockedLevel}
              >
                Level {entry.id} · {entry.difficulty}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">Unlocked to Level {progress.unlockedLevel}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-slate-800/70 p-2">
            <div className="text-slate-400">Difficulty</div>
            <div className="font-medium">{level.difficulty}</div>
          </div>
          <div className="rounded-md bg-slate-800/70 p-2">
            <div className="text-slate-400">Target</div>
            <div className="font-medium">{Math.floor(level.timeTargetSeconds / 60)}m</div>
          </div>
          <div className="rounded-md bg-slate-800/70 p-2">
            <div className="text-slate-400">Elapsed</div>
            <div className="font-medium">{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</div>
          </div>
          <div className="rounded-md bg-slate-800/70 p-2">
            <div className="text-slate-400">Shuffles</div>
            <div className="font-medium">{shufflesRemaining}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => resetLevel(level.id)}>Restart</Button>
          <Button variant="outline" onClick={showHint}><Lightbulb className="size-4" />Hint</Button>
          <Button variant="outline" onClick={shuffle} disabled={shufflesRemaining <= 0}>
            <Shuffle className="size-4" />Shuffle
          </Button>
          {deferredInstallPrompt ? (
            <Button variant="default" onClick={attemptInstall}>
              <Download className="size-4" />Install
            </Button>
          ) : null}
        </div>

        {allMatched ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <div className="mb-1 flex items-center gap-2 font-medium"><Trophy className="size-4" />Level cleared!</div>
            Best Time: {progress.bestTimes[level.id] ?? elapsedSeconds}s
          </div>
        ) : !availableMatch ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            No available matches right now. Use a hint or shuffle.
          </div>
        ) : null}
      </CardContent>
    </>
  )

  return (
    <main className="min-h-screen bg-slate-950 p-3 pt-16 text-slate-100 sm:p-4 md:p-8 lg:pt-8">
      <Button
        type="button"
        variant="outline"
        className="fixed top-3 left-3 z-20 h-10 w-10 border-slate-600 bg-slate-900/95 p-0 text-slate-100 hover:bg-slate-800 lg:hidden"
        onClick={() => setIsMobileMenuOpen((value) => !value)}
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      <div className="mx-auto grid max-w-6xl gap-4 md:gap-6 lg:grid-cols-[340px_1fr]">
        <Card className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
          {controlsPanel}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Level {level.id}</CardTitle>
            <CardDescription>
              Match identical open tiles. Tiles are open when at least one side is free.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
              }}
            >
              {tiles.map((tile) => {
                const isSelected = selectedTileId === tile.id
                const isHint = hintPair?.includes(tile.id)
                const selectable = isTileSelectable(tiles, tile.id)

                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => handleTileClick(tile.id)}
                    disabled={tile.matched || !selectable || allMatched}
                    className={[
                      'aspect-square rounded-md border text-4xl leading-none transition-all md:text-5xl focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2',
                      tile.matched
                        ? 'border-transparent bg-slate-900/40 text-transparent'
                        : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-white',
                      isSelected ? selectedTileClasses : '',
                      isHint && !isSelected ? 'ring-2 ring-amber-400' : '',
                      !selectable && !tile.matched ? 'opacity-60' : '',
                    ].join(' ')}
                    aria-pressed={isSelected}
                    aria-label={tile.matched ? 'Matched tile' : `Tile ${tile.value}`}
                  >
                    {tile.matched ? '·' : tile.value}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default App
