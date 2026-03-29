import type { ParsedLevel } from "./parseLevel";

export type Direction = "up" | "down" | "left" | "right";

export type GameState = {
  /** Index in `LEVELS` array (for unlock / persistence). */
  levelArrayIndex: number;
  grid: ParsedLevel["grid"];
  player: { r: number; c: number };
  movesLeft: number;
  totalZoops: number;
  collected: number;
  status: "playing" | "won" | "lost";
  bump: boolean;
};

function countZoops(grid: ParsedLevel["grid"]): number {
  let n = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === "zoop") n++;
    }
  }
  return n;
}

function cloneGrid(grid: ParsedLevel["grid"]) {
  return grid.map((row) => [...row]);
}

export function createInitialState(
  level: ParsedLevel,
  levelArrayIndex: number,
): GameState {
  const grid = cloneGrid(level.grid);
  return {
    levelArrayIndex,
    grid,
    player: { ...level.start },
    movesLeft: level.maxMoves,
    totalZoops: countZoops(grid),
    collected: 0,
    status: "playing",
    bump: false,
  };
}

function offset(dir: Direction): { dr: number; dc: number } {
  switch (dir) {
    case "up":
      return { dr: -1, dc: 0 };
    case "down":
      return { dr: 1, dc: 0 };
    case "left":
      return { dr: 0, dc: -1 };
    case "right":
      return { dr: 0, dc: 1 };
  }
}

export type GameAction =
  | { type: "MOVE"; direction: Direction }
  | { type: "LOAD_LEVEL"; level: ParsedLevel; levelArrayIndex: number }
  | { type: "CLEAR_BUMP" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CLEAR_BUMP":
      return { ...state, bump: false };
    case "LOAD_LEVEL":
      return createInitialState(action.level, action.levelArrayIndex);
    case "MOVE": {
      if (state.status !== "playing") return state;

      const { dr, dc } = offset(action.direction);
      const nr = state.player.r + dr;
      const nc = state.player.c + dc;
      const row = state.grid[nr];
      if (!row || nc < 0 || nc >= row.length) {
        return { ...state, bump: true };
      }
      const cell = row[nc];
      if (cell === "wall") {
        return { ...state, bump: true };
      }

      const nextGrid = cloneGrid(state.grid);
      let collected = state.collected;
      if (cell === "zoop") {
        nextGrid[nr][nc] = "empty";
        collected += 1;
      }

      const movesLeft = state.movesLeft - 1;
      const next: GameState = {
        ...state,
        grid: nextGrid,
        player: { r: nr, c: nc },
        movesLeft,
        collected,
        bump: false,
      };

      if (collected >= state.totalZoops) {
        return { ...next, status: "won", movesLeft };
      }
      if (movesLeft <= 0) {
        return { ...next, status: "lost" };
      }
      return next;
    }
    default:
      return state;
  }
}
