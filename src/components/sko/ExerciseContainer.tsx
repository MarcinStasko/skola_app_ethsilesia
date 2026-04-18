import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { ExerciseProgress } from "./ExerciseProgress";
import { FeedbackOverlay, type FeedbackKind } from "./FeedbackOverlay";
import { Button } from "@/components/ui/button";

/**
 * Generic exercise host. A mini-game registers an array of "steps" and
 * exposes its UI through `renderStep`. The container handles:
 *   - progress bar
 *   - per-step feedback overlay
 *   - speed-bonus multiplier (faster correct answers = more SKO Coins)
 *   - awarding coins/xp + marking lesson complete on finish
 *   - smooth AnimatePresence step transitions
 *
 * Why generic: every Phase 4+ mini-game (skarbonka, kantor, sejf, odsetki)
 * follows the same loop. We pay the abstraction cost once.
 */

export interface ExerciseStepProps {
  /** Mini-game calls this when the user submits an answer. */
  submit: (correct: boolean, explanation?: string) => void;
  /** Useful for resetting child state on retry. */
  attempt: number;
}

export interface ExerciseRunnerProps {
  lessonId: string;
  title: string;
  subtitle?: string;
  /** Coins awarded per correct answer at base multiplier (1x). */
  baseReward: number;
  /** Number of steps; renderStep is called with index 0..steps-1. */
  steps: number;
  renderStep: (index: number, props: ExerciseStepProps) => React.ReactNode;
  onExit: () => void;
}

export const ExerciseContainer = ({
  lessonId, title, subtitle, baseReward, steps, renderStep, onExit,
}: ExerciseRunnerProps) => {
  const mode = useGamificationStore((s) => s.mode);
  const awardCoins = useGamificationStore((s) => s.awardCoins);
  const awardXp = useGamificationStore((s) => s.awardXp);
  const markLessonComplete = useGamificationStore((s) => s.markLessonComplete);

  const [stepIdx, setStepIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | undefined>();
  const [lastReward, setLastReward] = useState(0);
  const [stepStart, setStepStart] = useState(() => Date.now());
  const [totalEarned, setTotalEarned] = useState(0);
  const [finished, setFinished] = useState(false);

  /**
   * Speed multiplier:
   *   <3s   → 2.0x (instant)
   *   <6s   → 1.5x
   *   <12s  → 1.2x
   *   else  → 1.0x
   * Encourages confident, fast play without punishing thinkers too hard.
   */
  const computeReward = (elapsedMs: number) => {
    const s = elapsedMs / 1000;
    const mult = s < 3 ? 2 : s < 6 ? 1.5 : s < 12 ? 1.2 : 1;
    return Math.round(baseReward * mult);
  };

  const submit = useCallback((correct: boolean, explanation?: string) => {
    if (feedback) return; // ignore double-submits while overlay is up
    if (correct) {
      const reward = computeReward(Date.now() - stepStart);
      setLastReward(reward);
      setFeedbackMsg(explanation);
      setFeedback("success");
    } else {
      setLastReward(0);
      setFeedbackMsg(explanation ?? "Sprawdź jeszcze raz wartości.");
      setFeedback("error");
    }
  }, [feedback, stepStart]);

  const dismissFeedback = () => {
    if (feedback === "success") {
      // bank the reward
      awardCoins(lastReward);
      awardXp(20);
      setTotalEarned((t) => t + lastReward);

      const nextIdx = stepIdx + 1;
      if (nextIdx >= steps) {
        markLessonComplete(lessonId);
        setFinished(true);
      } else {
        setStepIdx(nextIdx);
        setStepStart(Date.now());
      }
    } else {
      // retry same step, force child remount via attempt bump
      setAttempt((a) => a + 1);
      setStepStart(Date.now());
    }
    setFeedback(null);
  };

  const stepNode = useMemo(
    () => renderStep(stepIdx, { submit, attempt }),
    [renderStep, stepIdx, submit, attempt]
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={mode === "cyber"
        ? "border-b border-primary/30 bg-background/80 backdrop-blur-xl"
        : "border-b-4 border-primary/15 bg-card/90 backdrop-blur-xl"}
      >
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Wyjdź">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-black sm:text-xl">{title}</h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="container pb-4">
          <ExerciseProgress current={stepIdx + (finished ? 1 : 0)} total={steps} />
        </div>
      </div>

      {/* Step body */}
      <div className="container max-w-3xl py-8">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={`${stepIdx}-${attempt}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              {stepNode}
            </motion.div>
          ) : (
            <FinishedCard total={totalEarned} onExit={onExit} mode={mode} />
          )}
        </AnimatePresence>
      </div>

      <FeedbackOverlay
        kind={feedback}
        message={feedbackMsg}
        coinsEarned={lastReward}
        onDismiss={dismissFeedback}
      />
    </div>
  );
};

const FinishedCard = ({
  total, onExit, mode,
}: { total: number; onExit: () => void; mode: "junior" | "cyber" }) => (
  <motion.div
    key="done"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 18 }}
    className={mode === "cyber"
      ? "rounded-md border border-primary/40 bg-card p-8 text-center shadow-bouncy"
      : "rounded-3xl bg-card p-10 text-center shadow-bouncy"}
  >
    <div className="text-6xl">{mode === "cyber" ? "💎" : "🏆"}</div>
    <h2 className={[
      "mt-3 font-display font-black",
      mode === "cyber" ? "text-2xl uppercase tracking-widest text-primary text-glow" : "text-3xl text-primary",
    ].join(" ")}>
      {mode === "cyber" ? "MISSION COMPLETE" : "Lekcja ukończona!"}
    </h2>
    <p className="mt-2 text-muted-foreground">
      Zarobiłeś{" "}
      <strong className="text-coin-foreground">+{total} SKO</strong>{" "}
      i odblokowałeś nową wiedzę.
    </p>
    <Button
      onClick={onExit}
      className="mt-6 h-12 rounded-2xl bg-gradient-primary px-8 font-display font-black shadow-bouncy"
    >
      Wróć na mapę
    </Button>
  </motion.div>
);
