'use strict';

const STORAGE_KEY = '2048-best';
const SIZE = 4;

const boardEl   = document.getElementById('board');
const scoreEl   = document.getElementById('score');
const bestEl    = document.getElementById('best');
const overlayEl = document.getElementById('game-over-overlay');

let grid, score, bestScore, gameOver;

function init() {
  grid     = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  score    = 0;
  gameOver = false;

  bestScore = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

  overlayEl.classList.remove('visible');
  spawnTile();
  spawnTile();
  render();
}

function spawnTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) empty.push([r, c]);

  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return [r, c];
}

/* Slide a single row/column array left; return { row, merged } */
function slideLeft(line) {
  const vals = line.filter(v => v !== 0);
  const result = Array(SIZE).fill(0);
  const mergedCols = new Set();
  let gain = 0;
  let ri = 0;

  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1] && !mergedCols.has(ri)) {
      result[ri] = vals[i] * 2;
      gain += result[ri];
      mergedCols.add(ri);
      ri++;
      i++;
    } else {
      result[ri++] = vals[i];
    }
  }
  return { row: result, gain, mergedCols };
}

function move(dir) {
  if (gameOver) return;

  let moved = false;
  let gainTotal = 0;
  const newMergedPositions = [];

  for (let i = 0; i < SIZE; i++) {
    let line, setLine;

    if (dir === 'left') {
      line    = grid[i].slice();
      setLine = r => { grid[i] = r; };
    } else if (dir === 'right') {
      line    = grid[i].slice().reverse();
      setLine = r => { grid[i] = r.reverse(); };
    } else if (dir === 'up') {
      line    = grid.map(row => row[i]);
      setLine = r => { r.forEach((v, ri) => { grid[ri][i] = v; }); };
    } else { // down
      line    = grid.map(row => row[i]).reverse();
      setLine = r => { r.reverse().forEach((v, ri) => { grid[ri][i] = v; }); };
    }

    const { row, gain, mergedCols } = slideLeft(line);

    if (row.some((v, idx) => v !== line[idx])) moved = true;
    gainTotal += gain;
    setLine(row);

    // Track merged positions for animation
    if (mergedCols.size > 0) {
      mergedCols.forEach(pos => {
        if (dir === 'left')  newMergedPositions.push([i, pos]);
        if (dir === 'right') newMergedPositions.push([i, SIZE - 1 - pos]);
        if (dir === 'up')    newMergedPositions.push([pos, i]);
        if (dir === 'down')  newMergedPositions.push([SIZE - 1 - pos, i]);
      });
    }
  }

  if (!moved) return;

  score += gainTotal;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(STORAGE_KEY, bestScore);
  }

  const spawned = spawnTile();
  render(newMergedPositions, spawned);

  if (isGameOver()) {
    gameOver = true;
    overlayEl.classList.add('visible');
  }
}

function render(mergedPositions = [], spawnedPos = null) {
  boardEl.innerHTML = '';

  // Background cells
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
  }

  // Tiles
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (val === 0) continue;

      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.value = val;
      tile.textContent = val;
      tile.style.setProperty('--col', c + 1);
      tile.style.setProperty('--row', r + 1);

      const isMerged  = mergedPositions.some(([mr, mc]) => mr === r && mc === c);
      const isSpawned = spawnedPos && spawnedPos[0] === r && spawnedPos[1] === c;

      if (isMerged)       tile.classList.add('merge');
      else if (isSpawned) tile.classList.add('new');

      boardEl.appendChild(tile);
    }
  }

  scoreEl.textContent = score;
  bestEl.textContent  = bestScore;
}

function isGameOver() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return false;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return false;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return false;
    }
  return true;
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const map = {
    ArrowLeft:  'left',
    ArrowRight: 'right',
    ArrowUp:    'up',
    ArrowDown:  'down',
  };
  if (map[e.key]) {
    e.preventDefault();
    move(map[e.key]);
  }
});

// ── Touch / Swipe ─────────────────────────────────────────────────────────────
let touchStartX = 0, touchStartY = 0;

boardEl.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

boardEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const MIN = 30;

  if (Math.abs(dx) < MIN && Math.abs(dy) < MIN) return;

  if (Math.abs(dx) >= Math.abs(dy)) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

// ── Restart ───────────────────────────────────────────────────────────────────
document.getElementById('restart').addEventListener('click', init);
document.getElementById('restart-overlay').addEventListener('click', init);

// ── Boot ──────────────────────────────────────────────────────────────────────
init();
