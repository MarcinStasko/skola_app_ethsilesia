import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { X } from "lucide-react";

/**
 * MascotGuide — "Skarbonka Cię prowadzi".
 *
 * A floating mascot popup that delivers contextual hints. Two visual moods
 * via store mode:
 *   - junior: bouncy pink piggy 🐷 with a candy speech bubble
 *   - cyber:  cyan AI-assistant ◈ with a terminal frame and glitch-in
 *
 * API is intentionally tiny: parent pushes a `tip` string (or null to hide)
 * and we handle entrance/exit, auto-dismiss, and dismissibility. Tip
 * changes mid-flight cleanly cross-fade because we key on the message.
 *
 * Why a single component instead of a global toast: lessons need precise
 * positioning ("anchor=bottom-left" near the tray, not a screen-corner
 * toast) AND mode-aware styling. Toast libs hate both of those.
 */

export interface MascotGuideProps {
  /** Active hint. Pass null to hide. */
  tip: string | null;
  /** Auto-dismiss after N ms. 0 = never. */
  autoDismissMs?: number;
  /** Called when the user X's the bubble or auto-dismiss fires. */
  onDismiss?: () => void;
  /** Position preset. Default bottom-left of the parent. */
  anchor?: "bottom-left" | "bottom-right" | "top-right";
  /** Optional CTA inside the bubble. */
  action?: { label: string; onClick: () => void };
}

const ANCHOR_CLS: Record<NonNullable<MascotGuideProps["anchor"]>, string> = {
  "bottom-left":  "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
  "top-right":    "top-3 right-3",
};

export const MascotGuide = ({
  tip,
  autoDismissMs = 6000,
  onDismiss,
  anchor = "bottom-left",
  action,
}: MascotGuideProps) => {
  const mode = useGamificationStore((s) => s.mode);

  // Auto-dismiss with cleanup on tip change so consecutive hints don't
  // race-clear each other.
  useEffect(() => {
    if (!tip || !autoDismissMs) return;
    const id = setTimeout(() => onDismiss?.(), autoDismissMs);
    return () => clearTimeout(id);
  }, [tip, autoDismissMs, onDismiss]);

  return (
    <div className={`pointer-events-none absolute z-30 ${ANCHOR_CLS[anchor]}`}>
      <AnimatePresence mode="wait">
        {tip && (
          <motion.div
            key={tip}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="pointer-events-auto flex items-end gap-2"
          >
            {mode === "junior" ? (
              <JuniorMascot />
            ) : (
              <CyberMascot />
            )}

            <div
              className={[
                "relative max-w-[260px] rounded-2xl px-4 py-3 text-sm shadow-bouncy",
                mode === "cyber"
                  ? "border border-primary/40 bg-card font-mono text-primary [text-shadow:0_0_6px_hsl(var(--primary)/0.5)]"
                  : "bg-card font-display font-bold text-foreground",
              ].join(" ")}
            >
              {/* speech-bubble tail */}
              <span
                className={[
                  "absolute bottom-3 -left-1.5 h-3 w-3 rotate-45",
                  mode === "cyber"
                    ? "border-b border-l border-primary/40 bg-card"
                    : "bg-card",
                ].join(" ")}
              />

              <button
                aria-label="Zamknij podpowiedź"
                onClick={() => onDismiss?.()}
                className="absolute -right-1 -top-1 rounded-full bg-muted p-0.5 text-muted-foreground shadow-soft hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>

              <div className={mode === "cyber" ? "pr-3" : "pr-2"}>
                {mode === "cyber" && (
                  <span className="mr-1 text-[10px] uppercase tracking-widest opacity-70">
                    &gt; HINT::
                  </span>
                )}
                {tip}
              </div>

              {action && (
                <button
                  onClick={action.onClick}
                  className={[
                    "mt-2 rounded-md px-3 py-1 text-xs font-bold shadow-soft transition-transform hover:scale-105",
                    mode === "cyber"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-primary text-primary-foreground",
                  ].join(" ")}
                >
                  {action.label}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JuniorMascot = () => (
  <motion.div
    animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    className="text-4xl drop-shadow-md"
    aria-hidden
  >
    🐷
  </motion.div>
);

const CyberMascot = () => {
  // Tiny "AI orb" — pulsing diamond that subtly hints "this is the AI advisor".
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      key={pulse}
      initial={{ scale: 0.85, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="grid h-9 w-9 place-items-center rounded-md border border-primary/60 bg-background font-mono text-lg font-black text-primary text-glow"
      aria-hidden
    >
      ◈
    </motion.div>
  );
};
