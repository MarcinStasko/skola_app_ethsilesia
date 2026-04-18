import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { DraggableCoin } from "../DraggableCoin";
import { PiggyBank, type PiggyBankHandle } from "../PiggyBank";
import { MascotGuide } from "../MascotGuide";
import { useMascotGuide } from "@/hooks/useMascotGuide";
import { Button } from "@/components/ui/button";

/**
 * "Wrzuć do Skarbonki" — Klasa 1, addition / coin recognition.
 *
 * Mechanics:
 *  1. We generate a target sum (e.g. 8 zł) and a tray of mixed coins
 *     (1 zł / 2 zł / 5 zł). The tray ALWAYS contains enough denominations
 *     to make the sum, plus a couple of decoys so it's not trivial.
 *  2. The child drags coins toward the piggy bank. We use viewport
 *     coordinates from Framer's PanInfo and intersect them with the
 *     piggy bank's live bounding rect — that way the drop zone tracks
 *     layout shifts (mobile rotation, dynamic resize) for free.
 *  3. Dropped coins are added to a running tally. Once the tally
 *     equals the target, the step succeeds. If it overshoots, we
 *     auto-fail so the child learns that "more is not always better".
 *
 * Pedagogy: real Polish coins (silver 1zł, bimetal 2zł, bimetal 5zł)
 * train coin recognition alongside the arithmetic.
 */

type Coin = { id: string; value: 1 | 2 | 5 };

interface Round {
  target: number;
  coins: Coin[];
}

const ROUNDS: Round[] = [
  // Klasa 1: liczby do 10 — proste sumy
  { target: 5,  coins: c([1,1,1,2,2,5]) },
  { target: 7,  coins: c([1,2,2,2,5,1]) },
  { target: 8,  coins: c([1,2,2,5,1,2]) },
  // Trochę trudniej, w okolicy 10-12
  { target: 10, coins: c([5,5,2,2,1,1]) },
  { target: 12, coins: c([5,5,2,2,1,1]) },
];

function c(values: Array<1 | 2 | 5>): Coin[] {
  return values.map((v, i) => ({ id: `${v}-${i}-${Math.random().toString(36).slice(2, 6)}`, value: v }));
}

export const PiggyBankLesson = ({ onExit }: { onExit: () => void }) => (
  <ExerciseContainer
    lessonId="g1-piggy-bank"
    title="Wrzuć do Skarbonki 🐷"
    subtitle="Klasa 1 · Dodawanie do 12"
    baseReward={15}
    steps={ROUNDS.length}
    onExit={onExit}
    renderStep={(i, props) => <PiggyRound key={i} round={ROUNDS[i]} {...props} />}
  />
);

const PiggyRound = ({
  round, submit,
}: { round: Round } & ExerciseStepProps) => {
  // Field = the entire interactive arena (drag bounds).
  const fieldRef = useRef<HTMLDivElement>(null);
  const piggyRef = useRef<PiggyBankHandle>(null);

  // Coins still on the tray (not yet swallowed).
  const [tray, setTray] = useState<Coin[]>(round.coins);
  // Running tally inside the piggy bank.
  const [tally, setTally] = useState(0);
  const [floatingHint, setFloatingHint] = useState<string | null>(null);

  // Mascot ("Skarbonka Cię prowadzi") — contextual coaching layer.
  const { tip, show: showTip, dismiss: dismissTip } = useMascotGuide();

  const fillPct = useMemo(
    () => Math.min(100, (tally / Math.max(round.target, 1)) * 100),
    [tally, round.target]
  );

  /**
   * Idle coach: if the player hasn't acted within 8s, Skarbonka offers
   * the most useful tip we can derive from current state. Resets on
   * every tally change so it only fires on true inactivity.
   */
  useEffect(() => {
    const remaining = round.target - tally;
    if (remaining <= 0) return;
    const id = setTimeout(() => {
      if (remaining === 5 && tray.some((c) => c.value === 5)) {
        showTip("Spróbuj wrzucić 5 zł zamiast pięciu monet po 1 zł!");
      } else if (remaining === 2 && tray.some((c) => c.value === 2)) {
        showTip("Brakuje 2 zł — masz monetę 2 zł, użyj jej.");
      } else if (remaining >= 5 && tray.some((c) => c.value === 5)) {
        showTip(`Brakuje ${remaining} zł. Zacznij od największej monety — 5 zł.`);
      } else {
        showTip(`Brakuje jeszcze ${remaining} zł. Policz monety na tacce.`);
      }
    }, 8000);
    return () => clearTimeout(id);
  }, [tally, tray, round.target, showTip]);

  /**
   * Hit-test: does the release point sit inside the piggy bank rect?
   * We inflate the rect by a 16px margin so chunky fingers + small
   * piggy SVG remain forgiving.
   */
  const isInsidePiggy = (x: number, y: number) => {
    const r = piggyRef.current?.getRect();
    if (!r) return false;
    const m = 16;
    return x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m;
  };

  const handleDropEnd = (id: string, point: { x: number; y: number }) => {
    const coin = tray.find((c) => c.id === id);
    if (!coin) return;
    if (!isInsidePiggy(point.x, point.y)) {
      // Coach on aim after a miss — chunky-finger empathy.
      showTip("Przeciągnij monetę aż na różowy brzuszek skarbonki 🐷");
      return;
    }

    const nextTally = tally + coin.value;

    setTray((prev) => prev.filter((c) => c.id !== id));
    setTally(nextTally);
    dismissTip(); // a successful drop clears any pending coaching

    if (nextTally === round.target) {
      piggyRef.current?.reactCorrect();
      setTimeout(() => submit(true, `Świetnie! ${round.target} zł w skarbonce.`), 350);
    } else if (nextTally > round.target) {
      piggyRef.current?.reactWrong();
      flash(`Za dużo! Cel: ${round.target} zł, a w skarbonce już ${nextTally} zł`);
      showTip(`Skarbonka jest pełna — ${nextTally} zł to za dużo. Spróbuj mniejszych monet.`);
      setTimeout(() => submit(false, `Cel to ${round.target} zł — wrzuciłeś za dużo.`), 600);
    } else {
      flash(`+${coin.value} zł! Brakuje ${round.target - nextTally}`);
    }
  };

  const flash = (msg: string) => {
    setFloatingHint(msg);
    setTimeout(() => setFloatingHint((cur) => (cur === msg ? null : cur)), 1200);
  };

  const handleSurrender = () => {
    // "Sprawdź" gdy gracz uważa, że to już koniec — przyda się dla
    // przypadków gdy zabraknie kombinacji. Akceptujemy tylko jeśli equal.
    if (tally === round.target) {
      submit(true, `Wynik: ${round.target} zł.`);
    } else {
      submit(false, `Brakuje ${round.target - tally} zł do celu.`);
    }
  };

  return (
    <div className="rounded-3xl bg-card p-6 shadow-bouncy sm:p-8">
      {/* Goal banner */}
      <div className="mb-4 text-center">
        <div className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Wrzuć do skarbonki dokładnie
        </div>
        <div className="mt-1 font-display text-5xl font-black text-primary sm:text-6xl">
          {round.target} zł
        </div>
      </div>

      {/* Field — drag bounds for ALL coins. position:relative so absolute
          floating-hint anchors here. */}
      <div
        ref={fieldRef}
        className="relative min-h-[420px] overflow-hidden rounded-2xl bg-gradient-sky p-4"
      >
        {/* Piggy bank — top center */}
        <div className="flex justify-center pt-2">
          <PiggyBank ref={piggyRef} fillPct={fillPct} />
        </div>

        {/* Live tally chip */}
        <motion.div
          layout
          className="mx-auto mt-2 inline-flex w-full items-center justify-center gap-2 font-display text-base font-bold"
        >
          <span className="rounded-full bg-card px-4 py-1 shadow-soft">
            W skarbonce:{" "}
            <span className="text-primary tabular-nums">{tally} zł</span>
            <span className="text-muted-foreground"> / {round.target}</span>
          </span>
        </motion.div>

        {/* Floating hint */}
        <AnimatePresence>
          {floatingHint && (
            <motion.div
              key={floatingHint}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 font-display text-sm font-bold text-primary-foreground shadow-bouncy"
            >
              {floatingHint}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coin tray — flex-wrapped at bottom */}
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-card/70 p-3 backdrop-blur-sm">
          <AnimatePresence>
            {tray.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-muted-foreground"
              >
                Tacka pusta — kliknij Sprawdź.
              </motion.div>
            )}
            {tray.map((coin) => (
              <DraggableCoin
                key={coin.id}
                id={coin.id}
                value={coin.value}
                constraintsRef={fieldRef}
                onDropEnd={handleDropEnd}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Skarbonka Cię prowadzi — kontekstowy coach (anchored to field) */}
        <MascotGuide tip={tip} onDismiss={dismissTip} anchor="bottom-left" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          💡 Wskazówka: chwyć monetę i przeciągnij ją na skarbonkę.
        </p>
        <Button
          onClick={handleSurrender}
          variant="outline"
          className="font-display font-bold"
        >
          Sprawdź
        </Button>
      </div>
    </div>
  );
};
