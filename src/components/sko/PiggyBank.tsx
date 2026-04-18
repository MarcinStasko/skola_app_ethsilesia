import { motion, useAnimationControls } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";

/**
 * Friendly piggy bank illustration that doubles as a drop target.
 *
 * Imperative handle exposes:
 *   - getRect():    current bounding rect for hit detection
 *   - reactCorrect(): happy bounce + slot flash
 *   - reactWrong():   shake + spit animation
 *
 * The illustration is pure SVG so it scales crisp on any device and
 * doesn't bloat the bundle with an asset.
 */
export interface PiggyBankHandle {
  getRect: () => DOMRect | null;
  reactCorrect: () => void;
  reactWrong: () => void;
}

export const PiggyBank = forwardRef<PiggyBankHandle, { fillPct?: number }>(
  ({ fillPct = 0 }, ref) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const controls = useAnimationControls();

    useImperativeHandle(ref, () => ({
      getRect: () => wrapRef.current?.getBoundingClientRect() ?? null,
      reactCorrect: () =>
        controls.start({
          scale: [1, 1.12, 0.98, 1],
          rotate: [0, -3, 3, 0],
          transition: { duration: 0.5, ease: "easeOut" },
        }),
      reactWrong: () =>
        controls.start({
          x: [0, -10, 10, -8, 8, -4, 4, 0],
          transition: { duration: 0.45 },
        }),
    }));

    // Cap the visible fill so the SVG never overflows.
    const fill = Math.max(0, Math.min(100, fillPct));

    return (
      <motion.div
        ref={wrapRef}
        animate={controls}
        className="relative mx-auto w-56 sm:w-64"
      >
        <svg viewBox="0 0 200 170" className="h-auto w-full drop-shadow-xl">
          {/* Body */}
          <defs>
            <linearGradient id="pigBody" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(346 80% 75%)" />
              <stop offset="100%" stopColor="hsl(346 70% 55%)" />
            </linearGradient>
            <clipPath id="pigClip">
              <ellipse cx="100" cy="95" rx="78" ry="55" />
            </clipPath>
          </defs>

          {/* Coin fill (rises from the bottom) */}
          <g clipPath="url(#pigClip)">
            <rect
              x="0"
              y={150 - (fill / 100) * 110}
              width="200"
              height="200"
              fill="hsl(45 100% 60%)"
              opacity="0.85"
            />
          </g>

          {/* Body outline */}
          <ellipse cx="100" cy="95" rx="78" ry="55" fill="url(#pigBody)" stroke="hsl(346 60% 35%)" strokeWidth="3" />
          {/* Ear */}
          <path d="M 60 55 Q 55 35 75 45 Z" fill="hsl(346 70% 60%)" stroke="hsl(346 60% 35%)" strokeWidth="2.5" />
          {/* Snout */}
          <ellipse cx="40" cy="92" rx="16" ry="14" fill="hsl(346 70% 65%)" stroke="hsl(346 60% 35%)" strokeWidth="2.5" />
          <circle cx="35" cy="89" r="2.2" fill="hsl(346 60% 25%)" />
          <circle cx="44" cy="89" r="2.2" fill="hsl(346 60% 25%)" />
          {/* Eye */}
          <circle cx="68" cy="78" r="3.5" fill="hsl(346 60% 18%)" />
          <circle cx="69" cy="77" r="1.2" fill="white" />
          {/* Legs */}
          <rect x="55" y="140" width="12" height="18" rx="3" fill="hsl(346 60% 45%)" />
          <rect x="135" y="140" width="12" height="18" rx="3" fill="hsl(346 60% 45%)" />
          {/* Tail */}
          <path d="M 178 90 q 10 -6 6 -16 q -2 -6 -10 -2" fill="none" stroke="hsl(346 60% 35%)" strokeWidth="3" strokeLinecap="round" />
          {/* Coin slot — the actual drop bullseye */}
          <rect x="92" y="42" width="36" height="6" rx="3" fill="hsl(346 60% 22%)" />
          {/* PKO branding */}
          <text x="100" y="118" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="14" fontWeight="900" fill="hsl(220 100% 30%)">
            SKO
          </text>
        </svg>

        {/* Pulsing target ring above the slot to teach kids where to drop */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[15%] h-12 w-12 -translate-x-1/2 rounded-full border-4 border-primary/60"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    );
  }
);
PiggyBank.displayName = "PiggyBank";
