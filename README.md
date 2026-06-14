# BdayGames

Frontend-only birthday game app built with React + Vite.

## Contributor notes

Repo-specific guidance for coding agents and contributors lives in [AGENTS.md](/home/array/projects/BdayGames/AGENTS.md).

## Scripts

- `npm install`
- `npm run dev`
- `npm run playtest`
- `npm run build`
- `npm test`

## Local playtest

Use `npm run playtest` when you want a dedicated local environment that keeps its saved state separate from normal development.

- Runs on `127.0.0.1:4174`
- Uses a separate browser storage key, so your regular dev game state will not collide with playtest saves
- Safe to use alongside other local projects

## Deployment

The repo includes [`.github/workflows/deploy.yml](/home/array/projects/BdayGames/.github/workflows/deploy.yml)` to publish the built app to GitHub Pages from the `main` branch.

In GitHub:

1. Open `Settings > Pages`
2. Set `Source` to `GitHub Actions`
3. Push to `main`

## Start your game!

- [BDay Games at Github.io](https://raul-arrabales.github.io/BdayGames/).
