import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * "Budżet Wycieczki" — Klasa 3. Tabliczka mnożenia do 100 + dodawanie.
 * Wartości losowane: students 5–10, ceny pozycji 2–9 zł, autokar 60–120 zł
 * (jednorazowo). Trudność rośnie: 2 pozycje → 2 pozycje → 2 pozycje + autokar.
 */

interface Item { name: string; emoji: string; unit: number; flat?: boolean }
interface Round { students: number; items: Item[] }

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[rand(0, arr.length - 1)];

const TICKET_OPTIONS = [
  { name: "Bilet do muzeum", emoji: "🎟️" },
  { name: "Bilet do ZOO",     emoji: "🦁" },
  { name: "Bilet do kina",    emoji: "🎬" },
  { name: "Bilet do teatru",  emoji: "🎭" },
  { name: "Bilet na basen",   emoji: "🏊" },
] as const;

const SNACK_OPTIONS = [
  { name: "Drożdżówka", emoji: "🥐" },
  { name: "Lody",       emoji: "🍦" },
  { name: "Popcorn",    emoji: "🍿" },
  { name: "Kanapka",    emoji: "🥪" },
  { name: "Sok",        emoji: "🧃" },
] as const;

const buildRounds = (): Round[] => {
  // Runda 1 — łatwa: małe ceny, mało uczniów.
  const r1Students = rand(5, 7);
  const t1 = pick(TICKET_OPTIONS);
  const s1 = pick(SNACK_OPTIONS);
  const r1: Round = {
    students: r1Students,
    items: [
      { ...t1, unit: rand(3, 6) },
      { ...s1, unit: rand(2, 4) },
    ],
  };

  // Runda 2 — średnia: większe ceny.
  const r2Students = rand(7, 9);
  const t2 = pick(TICKET_OPTIONS);
  const s2 = pick(SNACK_OPTIONS);
  const r2: Round = {
    students: r2Students,
    items: [
      { ...t2, unit: rand(5, 8) },
      { ...s2, unit: rand(3, 5) },
    ],
  };

  // Runda 3 — trudna: 3 pozycje + autokar (flat).
  const r3Students = rand(8, 10);
  const t3 = pick(TICKET_OPTIONS);
  const s3 = pick(SNACK_OPTIONS);
  const r3: Round = {
    students: r3Students,
    items: [
      { ...t3, unit: rand(5, 9) },
      { ...s3, unit: rand(3, 5) },
      { name: "Autokar", emoji: "🚌", unit: rand(6, 12) * 10, flat: true },
    ],
  };

  return [r1, r2, r3];
};

export const TripBudgetLesson = ({ onExit }: { onExit: () => void }) => {
  const rounds = useMemo(() => buildRounds(), []);
  return (
    <ExerciseContainer
      lessonId="g3-trip-budget"
      title="Budżet Wycieczki 🚌"
      subtitle="Klasa 3 · Tabliczka mnożenia w akcji"
      baseReward={25}
      steps={rounds.length}
      onExit={onExit}
      renderStep={(i, props) => <BudgetStep key={i} round={rounds[i]} {...props} />}
    />
  );
};

const BudgetStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  const [value, setValue] = useState("");

  const total = useMemo(
    () => round.items.reduce(
      (s, it) => s + (it.flat ? it.unit : it.unit * round.students), 0
    ),
    [round]
  );

  const handleSubmit = () => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      submit(false, "Wpisz liczbę całkowitą złotych.");
      return;
    }
    const ok = parsed === total;
    const breakdown = round.items
      .map((it) => it.flat ? `${it.unit}` : `${round.students}×${it.unit}=${round.students * it.unit}`)
      .join(" + ");
    submit(ok, ok ? undefined : `Poprawnie: ${breakdown} = ${total} zł.`);
  };

  return (
    <div className="rounded-3xl bg-card p-6 shadow-bouncy sm:p-8">
      <div className="mb-2 text-center font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Klasa wybiera się na wycieczkę 🎒
      </div>
      <h2 className="text-center font-display text-2xl font-black text-primary sm:text-3xl">
        {round.students} uczniów
      </h2>

      <div className="mt-5 space-y-2">
        {round.items.map((it, i) => {
          const sub = it.flat ? it.unit : it.unit * round.students;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-2xl bg-gradient-sky p-3"
            >
              <div className="text-3xl">{it.emoji}</div>
              <div className="flex-1">
                <div className="font-display font-bold text-foreground">{it.name}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {it.flat
                    ? `${it.unit} zł (jednorazowo)`
                    : `${it.unit} zł × ${round.students} = ${sub} zł`}
                </div>
              </div>
              <div className="font-display text-lg font-black text-primary">
                {sub} zł
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="text-center font-display text-base font-bold text-foreground">
          Ile <span className="text-primary">razem</span> zapłaci klasa?
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            inputMode="numeric"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-14 text-center font-display text-2xl font-black"
            autoFocus
          />
          <span className="font-display text-lg font-bold text-primary">zł</span>
        </div>
      </div>

      <Button
        disabled={!value}
        onClick={handleSubmit}
        className="mt-5 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
      >
        Sprawdź budżet
      </Button>
    </div>
  );
};
