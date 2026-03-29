"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { LEVELS } from "@/game/levels";
import {
  type Direction,
  gameReducer,
  createInitialState,
} from "@/game/gameReducer";
import { SwipeBoard } from "./SwipeBoard";

const STORAGE_KEY = "zoop_max_level";

function readMaxUnlocked(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw != null ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? Math.min(Math.max(0, n), LEVELS.length - 1) : 0;
}

function writeMaxUnlocked(idx: number) {
  window.localStorage.setItem(STORAGE_KEY, String(idx));
}

export function ZoopGame() {
  const initialIdx = useMemo(() => readMaxUnlocked(), []);
  const initialLevel = LEVELS[initialIdx] ?? LEVELS[0];
  const [maxUnlocked, setMaxUnlocked] = useState(initialIdx);

  const [state, dispatch] = useReducer(
    gameReducer,
    { level: initialLevel, idx: initialIdx },
    ({ level, idx }) => createInitialState(level, idx),
  );

  useEffect(() => {
    if (state.status !== "won") return;
    const nextIdx = state.levelArrayIndex + 1;
    if (nextIdx >= LEVELS.length) return;
    setMaxUnlocked((m) => {
      const n = Math.max(m, nextIdx);
      writeMaxUnlocked(n);
      return n;
    });
  }, [state.status, state.levelArrayIndex]);

  useEffect(() => {
    if (!state.bump) return;
    const t = window.setTimeout(() => dispatch({ type: "CLEAR_BUMP" }), 120);
    return () => window.clearTimeout(t);
  }, [state.bump]);

  const onSwipe = useCallback(
    (direction: Direction) => {
      dispatch({ type: "MOVE", direction });
    },
    [],
  );

  const restart = useCallback(() => {
    const level = LEVELS[state.levelArrayIndex] ?? LEVELS[0];
    dispatch({
      type: "LOAD_LEVEL",
      level,
      levelArrayIndex: state.levelArrayIndex,
    });
  }, [state.levelArrayIndex]);

  const nextLevel = useCallback(() => {
    const next = state.levelArrayIndex + 1;
    if (next >= LEVELS.length) return;
    if (state.status !== "won" && next > maxUnlocked) return;
    const level = LEVELS[next];
    dispatch({ type: "LOAD_LEVEL", level, levelArrayIndex: next });
  }, [state.levelArrayIndex, maxUnlocked, state.status]);

  const prevLevel = useCallback(() => {
    const prev = state.levelArrayIndex - 1;
    if (prev < 0) return;
    const level = LEVELS[prev];
    dispatch({ type: "LOAD_LEVEL", level, levelArrayIndex: prev });
  }, [state.levelArrayIndex]);

  const { rows, cols } = {
    rows: state.grid.length,
    cols: state.grid[0]?.length ?? 0,
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-zinc-300">
        <span>
          Level {state.levelArrayIndex + 1} / {LEVELS.length}
        </span>
        <span>
          Zoop {state.collected}/{state.totalZoops}
        </span>
        <span className={state.movesLeft <= 5 ? "text-rose-400" : ""}>
          Moves {state.movesLeft}
        </span>
      </div>

      <SwipeBoard
        onSwipe={onSwipe}
        disabled={state.status !== "playing"}
        className={`rounded-2xl border-2 p-2 transition-transform duration-100 ${
          state.bump ? "translate-x-0.5 border-rose-500/60" : "border-cyan-500/40"
        } bg-zinc-950/80 shadow-[0_0_24px_rgba(34,211,238,0.15)]`}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {state.grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = state.player.r === r && state.player.c === c;
              let bg = "bg-zinc-900/90";
              let content: ReactNode = null;
              if (cell === "wall") {
                bg = "bg-zinc-800";
              } else if (cell === "zoop") {
                content = (
                  <span className="text-lg drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">
                    ●
                  </span>
                );
                bg = "bg-fuchsia-950/50 ring-1 ring-fuchsia-500/30";
              } else {
                bg = "bg-zinc-900/60";
              }
              if (isPlayer) {
                content = (
                  <span className="text-xl drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]">
                    ◆
                  </span>
                );
              }
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex aspect-square items-center justify-center rounded-lg ${bg}`}
                >
                  {content}
                </div>
              );
            }),
          )}
        </div>
      </SwipeBoard>

      <p className="text-center text-xs text-zinc-500">
        Swipe on the grid — one move per swipe. Collect all Zoop orbs.
      </p>

      {state.status === "won" && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-center text-sm text-emerald-200">
          Level clear.
          {state.levelArrayIndex + 1 < LEVELS.length ? (
            <button
              type="button"
              className="mt-2 block w-full rounded-lg bg-emerald-600 py-2 font-medium text-white"
              onClick={nextLevel}
            >
              Next level
            </button>
          ) : (
            <p className="mt-2 text-emerald-300/90">You finished all levels.</p>
          )}
        </div>
      )}

      {state.status === "lost" && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-center text-sm text-rose-100">
          Out of moves.
          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-rose-600 py-2 font-medium text-white"
            onClick={restart}
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300"
          onClick={prevLevel}
          disabled={state.levelArrayIndex <= 0}
        >
          Prev level
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300"
          onClick={restart}
        >
          Reset
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300"
          onClick={nextLevel}
          disabled={
            state.levelArrayIndex + 1 >= LEVELS.length ||
            (state.status !== "won" &&
              state.levelArrayIndex + 1 > maxUnlocked)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
