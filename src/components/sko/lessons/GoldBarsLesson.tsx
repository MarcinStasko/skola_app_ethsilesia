import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";

/**
 * "Sztabki Złota" — Klasa 2.
 *
 * Cel pedagogiczny: ODEJMOWANIE w kontekście masy.
 * Mechanika: skarbiec ma X kg sztabek. Klient zabiera Y kg. Ile zostało?
 * Dla wariantów trudniejszych: dwóch klientów po kolei (X - a - b).
 *
 * Wizualizacja: stos sztabek 1kg. Po starcie pokazujemy X sztabek; po
 * pomyłce dziecko widzi animację "zabierania" Y sztabek.
 */

interface Round {
  start: number;          // kg sztabek na starcie
  takes: number[];        // kolejne kwoty zabrane przez klientów
  story: string;
}

const ROUNDS: Round[] = [
  { start: 10, takes: [3],    story: "W skarbcu jest 10 sztabek po 1 kg. Klient zabiera 3 sztabki." },
  { start: 12, takes: [4],    story: "Skarbiec ma 12 sztabek. Sprzedajesz 4." },
  { start: 15, takes: [5, 3], story: "15 sztabek. Pierwszy klient bierze 5, drugi 3." },
  { start: 18, takes: [6, 4], story: "18 sztabek. Dwóch klientów: 6 i 4." },
  { start: 20, takes: [7, 5], story: "20 sztabek. Klient A: 7, klient B: 5." },
];

export const GoldBarsLesson = ({ onExit }: { onExit: () => void }) => (
  <ExerciseContainer
    lessonId="g2-gold-bars"
    title="Sztabki Złota 🏆"
    subtitle="Klasa 2 · Odejmowanie i waga (kg)"
    baseReward={20}
    steps={ROUNDS.length}
    onExit={onExit}
    renderStep={(i, props) => <BarsStep key={i} round={ROUNDS[i]} {...props} />}
  />
);

const BarsStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  const [picked, setPicked] = useState<number | null>(null);
  const left = useMemo(
    () => round.takes.reduce((s, t) => s - t, round.start),
    [round]
  );
  const totalTaken = round.takes.reduce((s, t) => s + t, 0);

  const options = useMemo(() => {
    const set = new Set<number>([left]);
    set.add(round.start - round.takes[0]); // częsty błąd: odjęcie tylko pierwszej
    set.add(left + 1);
    set.add(Math.max(0, left - 1));
    set.add(round.start + totalTaken);     // błąd: dodawanie zamiast odejmowania
    return Array.from(set).slice(0, 4).sort((a, b) => a - b);
  }, [left, round, totalTaken]);

  return (
    <div className="rounded-3xl bg-card p-6 shadow-bouncy sm:p-8">
      <div className="mb-2 text-center font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Skarbiec PKO 🏦
      </div>
      <p className="text-center text-base text-foreground sm:text-lg">{round.story}</p>

      {/* Wizualizacja sztabek — używamy tokena coin (złoty) z design system */}
      <div className="mt-5 rounded-2xl bg-coin/10 p-4 ring-1 ring-coin/30">
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: round.start }).map((_, i) => {
            const isTaken = i >= left;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: isTaken ? 0.25 : 1,
                  y: 0,
                  rotate: isTaken ? -12 : 0,
                  x: isTaken ? 6 : 0,
                }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                className={[
                  "relative flex h-6 w-12 items-center justify-center rounded-sm bg-coin font-display text-[9px] font-black text-coin-foreground shadow-coin sm:h-8 sm:w-16",
                  isTaken && "grayscale",
                ].join(" ")}
              >
                1kg
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-xs sm:text-sm">
          <Stat label="START" value={`${round.start} kg`} />
          <Stat label="ZABRANE" value={`-${totalTaken} kg`} accent />
          <Stat label="ZOSTAJE" value="?" highlight />
        </div>
      </div>

      <h2 className="mt-6 text-center font-display text-xl font-black text-primary sm:text-2xl">
        Ile sztabek zostanie?
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const sel = picked === opt;
          return (
            <button
              key={opt}
              onClick={() => setPicked(opt)}
              className={[
                "h-14 rounded-2xl border-2 font-display text-xl font-black transition-all",
                sel
                  ? "border-primary bg-primary text-primary-foreground scale-95"
                  : "border-border bg-secondary/40 hover:bg-secondary",
              ].join(" ")}
            >
              {opt} kg
            </button>
          );
        })}
      </div>

      <Button
        disabled={picked === null}
        onClick={() => submit(
          picked === left,
          picked === left
            ? undefined
            : `Poprawnie: ${round.start} - ${round.takes.join(" - ")} = ${left} kg.`
        )}
        className="mt-6 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
      >
        Sprawdź
      </Button>
    </div>
  );
};

const Stat = ({
  label, value, accent, highlight,
}: { label: string; value: string; accent?: boolean; highlight?: boolean }) => (
  <div className={[
    "rounded-lg border px-2 py-1.5",
    highlight ? "border-primary/60 bg-primary/10" :
    accent ? "border-destructive/40 bg-destructive/5" :
    "border-border bg-card/50",
  ].join(" ")}>
    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">
      {label}
    </div>
    <div className={[
      "mt-0.5 font-display font-black",
      highlight ? "text-primary" : accent ? "text-destructive" : "text-foreground",
    ].join(" ")}>
      {value}
    </div>
  </div>
);
