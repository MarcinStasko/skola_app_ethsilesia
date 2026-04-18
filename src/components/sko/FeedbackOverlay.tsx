import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamificationStore } from "@/store/useGamificationStore";
import { SkoCoin } from "./SkoCoin";
import pkoLogo from "@/assets/pko-logo.png";

export type FeedbackKind = "success" | "error" | null;

/**
 * Full-screen overlay shown after each answer.
 * - success: confetti coin shower + spring-pop card + auto-dismiss
 * - error:   red glitch flash + shake card, manual dismiss
 *
 * Auto-dismiss timing on success keeps the gameplay loop snappy
 * (the brief calls for "snappy + rewarding").
 */
export const FeedbackOverlay = ({
  kind,
  message,
  coinsEarned = 0,
  onDismiss,
}: {
  kind: FeedbackKind;
  message?: string;
  coinsEarned?: number;
  onDismiss: () => void;
}) => {
  const mode = useGamificationStore((s) => s.mode);

  // Auto-advance on success
  useEffect(() => {
    if (kind === "success") {
      const t = setTimeout(onDismiss, 1400);
      return () => clearTimeout(t);
    }
  }, [kind, onDismiss]);

  return (
    <AnimatePresence>
      {kind && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          onClick={kind === "error" ? onDismiss : undefined}
        >
          {/* Confetti shower for success — pure CSS/motion, no library */}
          {kind === "success" && <CoinConfetti />}

          {/* Glitch flash for error */}
          {kind === "error" && (
            <motion.div
              className="absolute inset-0 bg-destructive/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0, 0.5, 0] }}
              transition={{ duration: 0.45 }}
            />
          )}

          <motion.div
            key={kind}
            initial={kind === "success"
              ? { scale: 0.4, rotate: -10, opacity: 0 }
              : { x: 0, opacity: 0, scale: 0.95 }}
            animate={kind === "success"
              ? { scale: 1, rotate: 0, opacity: 1 }
              : { x: [0, -14, 14, -10, 10, -6, 6, 0], opacity: 1, scale: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={kind === "success"
              ? { type: "spring", stiffness: 380, damping: 14 }
              : { duration: 0.5 }}
            className={[
              "relative z-10 mx-4 max-w-sm rounded-3xl p-8 text-center shadow-bouncy",
              kind === "success"
                ? "bg-card border-4 border-success"
                : "bg-card border-4 border-destructive",
              mode === "cyber" && "rounded-md border-2",
            ].join(" ")}
          >
            <div className="mb-3 text-6xl">
              {kind === "success" ? (mode === "cyber" ? "✓" : "🎉") : (mode === "cyber" ? "✕" : "🤔")}
            </div>
            <h3 className={[
              "font-display text-2xl font-black",
              kind === "success" ? "text-success" : "text-destructive",
              mode === "cyber" && "text-glow uppercase tracking-widest text-lg",
            ].join(" ")}>
              {kind === "success"
                ? mode === "cyber" ? "TX CONFIRMED" : "Brawo!"
                : mode === "cyber" ? "ACCESS DENIED" : "Spróbuj jeszcze raz"}
            </h3>
            {message && (
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            )}

            {kind === "success" && coinsEarned > 0 && (
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.18 }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-coin/15 px-4 py-2 ring-2 ring-coin/40"
              >
                <SkoCoin size={28} spinning />
                <span className="font-display text-xl font-black tabular-nums">
                  +{coinsEarned}
                </span>
              </motion.div>
            )}

            {/* Endorsement PKO Bank Polski — kotwiczy nagrodę w realnym brandzie.
                Pokazujemy w obu kindach (success/error) bo to brand stamp.       */}
            <div className="mt-5 flex items-center justify-center gap-2 border-t border-border pt-3 opacity-80">
              <img
                src={pkoLogo}
                alt="PKO Bank Polski"
                className="h-6 w-auto"
                loading="lazy"
              />
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                SKO · PKO Bank Polski
              </span>
            </div>

            {kind === "error" && (
              <button
                onClick={onDismiss}
                className="mt-5 rounded-full bg-destructive px-6 py-2 font-display font-bold text-destructive-foreground shadow-soft"
              >
                {mode === "cyber" ? "RETRY ▸" : "Jeszcze raz"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Lightweight confetti — 24 falling coins with randomized arc + spin. */
const CoinConfetti = () => {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const x = (i * 137) % 100;            // pseudo-random spread
        const delay = (i % 8) * 0.04;
        const size = 14 + (i % 5) * 4;
        const drift = ((i * 53) % 60) - 30;   // -30..30 px sideways
        return (
          <motion.div
            key={i}
            className="absolute top-0"
            style={{ left: `${x}%` }}
            initial={{ y: -40, x: 0, rotate: 0, opacity: 0 }}
            animate={{ y: "110vh", x: drift, rotate: 540, opacity: [0, 1, 1, 0.6, 0] }}
            transition={{ duration: 1.4 + (i % 4) * 0.2, delay, ease: [0.2, 0.6, 0.4, 1] }}
          >
            <SkoCoin size={size} />
          </motion.div>
        );
      })}
    </div>
  );
};
