import { motion } from "framer-motion";
import { useGamificationStore } from "@/store/useGamificationStore";

/**
 * Transaction-style progress bar.
 * Junior: chunky candy bar with bouncing fill.
 * Cyber: terminal "uploading transaction" with hex tick + scanlines.
 */
export const ExerciseProgress = ({
  current,
  total,
}: { current: number; total: number }) => {
  const mode = useGamificationStore((s) => s.mode);
  const pct = Math.max(0, Math.min(100, (current / total) * 100));

  if (mode === "cyber") {
    return (
      <div className="font-mono text-[11px] uppercase tracking-widest">
        <div className="mb-1 flex items-center justify-between text-muted-foreground">
          <span>&gt; UPLOADING TX [{current.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}]</span>
          <span className="text-primary">{pct.toFixed(0)}%</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-sm border border-primary/30 bg-card">
          <motion.div
            className="h-full bg-gradient-primary"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          />
          <span className="scanlines absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span>Pytanie {current} z {total}</span>
        <span className="text-primary">{pct.toFixed(0)}%</span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-secondary shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
        />
      </div>
    </div>
  );
};
