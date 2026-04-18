import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";

/**
 * "Tydzień Kieszonkowego" — Klasa 1.
 *
 * Cel pedagogiczny: dni tygodnia + dodawanie do 20.
 * Wartości są losowane per uruchomienie ExerciseContainer (klucz `seed` w
 * useMemo) tak, by powtarzanie lekcji nie było nudne, ale poziom trudności
 * pozostał: kwoty 0–5 zł, sumy ≤ 20.
 */

type DayKey = "pn" | "wt" | "sr" | "cz" | "pt" | "sob" | "nd";
const DAY_LABEL: Record<DayKey, string> = {
  pn: "Pon", wt: "Wt", sr: "Śr", cz: "Czw", pt: "Pt", sob: "Sob", nd: "Nd",
};
const DAY_FULL: Record<DayKey, string> = {
  pn: "poniedziałek", wt: "wtorek", sr: "środa", cz: "czwartek",
  pt: "piątek", sob: "sobota", nd: "niedziela",
};
const DAYS: DayKey[] = ["pn", "wt", "sr", "cz", "pt", "sob", "nd"];

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

interface Round {
  amounts: Record<DayKey, number>;
  question: string;
  answer: number;
  highlight?: DayKey[];
}

/**
 * Generuje 3 zróżnicowane rundy: (1) tydzień szkolny, (2) weekend,
 * (3) cały tydzień. Sumy zawsze ≤ 20 zł żeby trzymać klasę 1.
 */
const buildRounds = (): Round[] => {
  // Runda 1 — tydzień szkolny: stała kwota 1–4 zł × 5 dni
  const weekday = rand(1, 4);
  const r1Amounts: Record<DayKey, number> = {
    pn: weekday, wt: weekday, sr: weekday, cz: weekday, pt: weekday,
    sob: 0, nd: 0,
  };

  // Runda 2 — weekend: 3–7 zł sob + 3–7 zł nd, dni szkolne 0–2 jako szum
  const r2Amounts: Record<DayKey, number> = {
    pn: rand(0, 2), wt: rand(0, 2), sr: rand(0, 2), cz: rand(0, 2), pt: rand(0, 2),
    sob: rand(3, 7), nd: rand(3, 7),
  };

  // Runda 3 — cały tydzień. Każdy dzień 0–3, suma ≤ ~20.
  const r3Amounts: Record<DayKey, number> = {
    pn: rand(0, 3), wt: rand(0, 3), sr: rand(0, 3), cz: rand(0, 3),
    pt: rand(0, 3), sob: rand(0, 3), nd: rand(0, 3),
  };

  return [
    {
      amounts: r1Amounts,
      question: "Ile zarobisz od poniedziałku do piątku?",
      answer: weekday * 5,
      highlight: ["pn", "wt", "sr", "cz", "pt"],
    },
    {
      amounts: r2Amounts,
      question: "Ile dostaniesz w weekend (sobota + niedziela)?",
      answer: r2Amounts.sob + r2Amounts.nd,
      highlight: ["sob", "nd"],
    },
    {
      amounts: r3Amounts,
      question: "Ile złotych zbierzesz przez cały tydzień?",
      answer: DAYS.reduce((s, d) => s + r3Amounts[d], 0),
      highlight: DAYS,
    },
  ];
};

export const PocketMoneyLesson = ({ onExit }: { onExit: () => void }) => {
  // Wylosuj zestaw rund raz na całą sesję lekcji (nie per krok).
  const rounds = useMemo(() => buildRounds(), []);
  return (
    <ExerciseContainer
      lessonId="g1-pocket-money"
      title="Tydzień Kieszonkowego 📅"
      subtitle="Klasa 1 · Dni tygodnia + dodawanie"
      baseReward={15}
      steps={rounds.length}
      onExit={onExit}
      renderStep={(i, props) => <PocketStep key={i} round={rounds[i]} {...props} />}
    />
  );
};

const PocketStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = round.answer;

  const options = useMemo(() => {
    const set = new Set<number>([correct]);
    let offset = 1;
    while (set.size < 4) {
      set.add(Math.max(0, correct + offset));
      set.add(Math.max(0, correct - offset));
      offset++;
    }
    return Array.from(set).slice(0, 4).sort((a, b) => a - b);
  }, [correct]);

  return (
    <div className="rounded-3xl bg-card p-6 shadow-bouncy sm:p-8">
      <div className="mb-3 text-center font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Twój tygodniowy kalendarz kieszonkowego
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAYS.map((d, i) => {
          const hi = round.highlight?.includes(d);
          const v = round.amounts[d];
          return (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={[
                "rounded-xl p-2 text-center sm:p-3",
                hi ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary/40",
              ].join(" ")}
              aria-label={`${DAY_FULL[d]}: ${v} złotych`}
            >
              <div className="font-display text-[10px] font-bold uppercase text-muted-foreground sm:text-xs">
                {DAY_LABEL[d]}
              </div>
              <div className={[
                "mt-1 font-display text-lg font-black sm:text-2xl",
                v === 0 ? "text-muted-foreground/40" : "text-coin-foreground",
              ].join(" ")}>
                {v}
              </div>
              <div className="text-[9px] font-bold text-muted-foreground sm:text-[10px]">zł</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <h2 className="font-display text-xl font-black text-primary sm:text-2xl">
          {round.question}
        </h2>
      </div>

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
              {opt} zł
            </button>
          );
        })}
      </div>

      <Button
        disabled={picked === null}
        onClick={() => submit(
          picked === correct,
          picked === correct ? undefined : `Poprawna odpowiedź to ${correct} zł.`
        )}
        className="mt-6 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
      >
        Sprawdź
      </Button>
    </div>
  );
};
