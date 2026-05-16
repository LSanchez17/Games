# Mahjong Journey

Mahjong Journey is an offline-first React + TypeScript game built with Vite, Tailwind, and shadcn-style components.

## Product goals (iterated from prompt)

- Launch a playable Mahjong starter experience focused on local progression.
- Ship with **300 levels** at three difficulty tiers (Easy, Medium, Hard).
- Support **offline play** with no internet requirement after install.
- Persist progression using **localStorage**.
- Be installable as a **PWA**.

## Current implementation

- 300 generated local levels with varied board sizes and shuffle limits.
- Tile matching gameplay with selectable/open tile rules.
- Hint and shuffle mechanics.
- Persisted unlocks, completions, and best times via localStorage.
- PWA manifest + service worker via `vite-plugin-pwa`.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```
