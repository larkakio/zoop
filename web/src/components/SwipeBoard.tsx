"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import type { Direction } from "@/game/gameReducer";

const SWIPE_MIN = 48;

type Props = {
  children: ReactNode;
  onSwipe: (direction: Direction) => void;
  className?: string;
  disabled?: boolean;
};

export function SwipeBoard({
  children,
  onSwipe,
  className = "",
  disabled,
}: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    if (disabled) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [disabled]);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (disabled) return;
      const start = startRef.current;
      startRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (Math.max(ax, ay) < SWIPE_MIN) return;

      let direction: Direction;
      if (ax >= ay) {
        direction = dx > 0 ? "right" : "left";
      } else {
        direction = dy > 0 ? "down" : "up";
      }
      onSwipe(direction);
    },
    [disabled, onSwipe],
  );

  const onPointerCancel = useCallback((e: ReactPointerEvent) => {
    startRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div
      role="application"
      aria-label="Zoop playfield — swipe to move"
      className={`touch-none select-none ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children}
    </div>
  );
}
