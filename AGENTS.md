# AGENTS.md

## Goal
Build a fully functional 2048 game as a single-page web app with responsive design for both desktop and mobile.

## Tech Stack
- Pure HTML5 / CSS3 / Vanilla JavaScript
- No external dependencies or build tools
- Deploy via GitHub Pages (root `/`)

## Architecture
- `index.html` — game markup and embedded or linked scripts/styles
- `style.css` — responsive grid, tile colors, animations
- `game.js` — game state, logic (merge, move, score), local storage

## Global Acceptance Criteria
1. The game renders a 4x4 grid with tiles on desktop and mobile viewports
2. Arrow keys (desktop) and swipe gestures (mobile) move tiles correctly
3. Matching tiles merge and score increments correctly
4. New tile (2 or 4) spawns after every valid move
5. Best score is persisted in localStorage across page reloads
6. Game-over state is detected and a restart button resets the game
7. No JavaScript errors in browser console during normal play
8. Site is live at https://aw-apps.github.io/2048-rwd-game/
