# AGENTS.md

## Project intent

Bday Games is a frontend-only birthday party web app for running family game events live.
It must work entirely in the browser and stay deployable to GitHub Pages or other static hosting.

## Hard constraints

- Do not add a backend, authentication, database, or server-side dependency.
- Keep the app compatible with static hosting.
- Persist event state in `localStorage`.
- Treat saved-state compatibility as important. If state shape changes, add or update migration handling.

## Product expectations

- Spanish is the default UI language.
- New UI copy should go through the localization dictionary, not be hardcoded in components.
- Optimize for a master-of-ceremony flow during a live family event:
  - large, readable controls
  - low-friction navigation
  - clear current-state visibility
  - safe recovery from accidental taps
- The visual style should feel energetic and game-show inspired, but still family friendly and readable from a distance.

## Content model

- Game logic is generic; game content should be authored separately as markdown packs.
- Prefer extending the markdown content system over hardcoding challenge or twist data into React components.
- Challenge categories currently include: `trivia`, `skill`, `creative`, `duel`, and `chaos`.
- Twist behavior should stay structured and operator-controlled rather than arbitrary scriptable logic.

## Engineering guidance

- Prefer small, typed state transitions over ad hoc component-side mutations.
- Keep reusable game rules in `src/lib`, UI in `src/components`, and authored content in `src/content`.
- Preserve GitHub Pages deployment compatibility when changing Vite config or routing behavior.
- Add or update tests for game state rules, markdown parsing, and core operator flows when behavior changes.

## Before finishing work

- Run `npm test`.
- Run `npm run build`.
- Keep generated artifacts out of git.
