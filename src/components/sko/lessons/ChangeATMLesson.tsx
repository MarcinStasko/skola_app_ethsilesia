import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";

/**
 * "Bankomat Reszta" — Klasa 3.
 *
 * Cel pedagogiczny: DZIELENIE i wydawanie reszty z banknotu 50 zł na
 * najmniejszą liczbę banknotów/monet (algorytm zachłanny — naturalna
 * intuicja "największy nominał najpierw").
 *
 * Mechanika dwuetapowa:
 *  1) Uczeń liczy resztę: 50 − cena = ?
 *  2) Składa tę resztę z dostępnych nominałów {20, 10, 5, 2, 1} klikając
 *     w monety/banknoty. Walidujemy sumę I optymalność (nie więcej sztuk
 *     niż rozwiązanie zachłanne — w tym zestawie nominałów zawsze optymalne).
 *
 * Ceny dobierane losowo tak, by reszta była "ładna" (1–49 zł, całkowita)
 * i wymagała ≥ 2 nominałów (żeby ćwiczenie miało sens).
 */

type Denom = 20 | 10 | 5 | 2 | 1;
const DENOMS: Denom[] = [20, 10, 5, 2, 1];

const DENOM_STYLE: Record<Denom, { kind: "note" | "coin"; cls: string; label: string }> = {
  20: { kind: "note", cls: "from-violet-400 to-violet-500 text-white",       label: "20 zł" },
  10: { kind: "note", cls: "from-emerald-400 to-emerald-500 text-white",     label: "10 zł" },
  5:  { kind: "coin", cls: "from-zinc-100 to-zinc-200 text-zinc-700 ring-amber-400/80", label: "5 zł" },
  2:  { kind: "coin", cls: "from-amber-300 to-amber-400 text-amber-900 ring-zinc-400/70", label: "2 zł" },
  1:  { kind: "coin", cls: "from-zinc-200 to-zinc-300 text-zinc-700 ring-zinc-400/60", label: "1 zł" },
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

interface Round {
  item: { name: string; emoji: string };
  price: number;
  change: number;
  /** Minimalna liczba sztuk nominałów potrzebna do wydania reszty (greedy). */
  optimal: number;
}

const ITEMS = [
  { name: "Pluszowy miś", emoji: "🧸" },
  { name: "Książka",      emoji: "📖" },
  { name: "Piłka",        emoji: "⚽" },
  { name: "Klocki",       emoji: "🧱" },
  { name: "Lalka",        emoji: "🪆" },
  { name: "Robot",        emoji: "🤖" },
  { name: "Puzzle",       emoji: "🧩" },
] as const;

const greedyCount = (amount: number): number => {
  let rest = amount;
  let n = 0;
  for (const d of DENOMS) {
    n += Math.floor(rest / d);
    rest %= d;
  }
  return n;
};

const buildRounds = (): Round[] => {
  const used = new Set<number>();
  const rounds: Round[] = [];
  // 4 rundy o rosnącej trudności reszty.
  const targets = [
    () => rand(7, 18),   // łatwa
    () => rand(13, 27),  // średnia
    () => rand(21, 38),  // trudna
    () => rand(31, 47),  // mistrzowska
  ];
  const items = [...ITEMS].sort(() => Math.random() - 0.5);

  targets.forEach((mkChange, i) => {
    let change = mkChange();
    // Wymuś ≥ 2 nominały i unikalność.
    let safety = 8;
    while ((greedyCount(change) < 2 || used.has(change)) && safety-- > 0) {
      change = mkChange();
    }
    used.add(change);
    rounds.push({
      item: items[i % items.length],
      price: 50 - change,
      change,
      optimal: greedyCount(change),
    });
  });

  return rounds;
};

export const ChangeATMLesson = ({ onExit }: { onExit: () => void }) => {
  const rounds = useMemo(() => buildRounds(), []);
  return (
    <ExerciseContainer
      lessonId="g3-change-atm"
      title="Bankomat Reszta 🏧"
      subtitle="Klasa 3 · Dzielenie + wydawanie reszty z 50 zł"
      baseReward={25}
      steps={rounds.length}
      onExit={onExit}
      renderStep={(i, props) => <ChangeStep key={i} round={rounds[i]} {...props} />}
    />
  );
};

const ChangeStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  // Etap 1 — uczeń wpisuje wartość reszty. Etap 2 — składa ją z nominałów.
  const [stage, setStage] = useState<1 | 2>(1);
  const [changeGuess, setChangeGuess] = useState<number | null>(null);
  const [picks, setPicks] = useState<Denom[]>([]);

  // Opcje dla etapu 1: poprawna + 3 dystraktory blisko.
  const stage1Options = useMemo(() => {
    const set = new Set<number>([round.change]);
    set.add(round.change + 1);
    set.add(Math.max(1, round.change - 1));
    set.add(round.price); // klasyczny błąd: pomylić cenę z resztą
    set.add(50 - round.change + 10);
    return Array.from(set).slice(0, 4).sort((a, b) => a - b);
  }, [round]);

  const sum = picks.reduce((s, d) => s + d, 0);
  const remaining = round.change - sum;

  const addPick = (d: Denom) => {
    if (sum + d > round.change) return; // nie pozwól przebić reszty
    setPicks((p) => [...p, d]);
  };
  const removePick = (idx: number) =>
    setPicks((p) => p.filter((_, i) => i !== idx));
  const reset = () => setPicks([]);

  const handleStage1 = () => {
    if (changeGuess === null) return;
    if (changeGuess === round.change) {
      setStage(2);
    } else {
      submit(false, `Reszta = 50 − ${round.price} = ${round.change} zł.`);
    }
  };

  const handleStage2 = () => {
    if (sum !== round.change) {
      submit(false, `Suma wynosi ${sum} zł, a powinno być ${round.change} zł.`);
      return;
    }
    if (picks.length > round.optimal) {
      submit(
        false,
        `Da się wydać ${round.change} zł używając tylko ${round.optimal} sztuk — zacznij od największych nominałów.`
      );
      return;
    }
    submit(true);
  };

  return (
    <div className="rounded-3xl bg-card p-6 shadow-bouncy sm:p-8">
      {/* Pasek postępu etapu */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <StageDot active={stage === 1} done={stage === 2} label="1. Policz resztę" />
        <div className="h-0.5 w-8 bg-border" />
        <StageDot active={stage === 2} done={false} label="2. Wydaj resztę" />
      </div>

      {/* Scena: klient + cena + banknot */}
      <div className="rounded-2xl bg-gradient-sky p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{round.item.emoji}</div>
            <div>
              <div className="font-display font-bold text-foreground">{round.item.name}</div>
              <div className="font-display text-2xl font-black text-primary">{round.price} zł</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Klient płaci
            </div>
            <Banknote value={50} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 1 ? (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mt-5"
          >
            <p className="text-center font-display text-base font-bold text-foreground">
              Ile wynosi <span className="text-primary">reszta</span>? <br />
              <span className="font-mono text-sm text-muted-foreground">
                50 zł − {round.price} zł = ?
              </span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {stage1Options.map((opt) => {
                const sel = changeGuess === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setChangeGuess(opt)}
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
              disabled={changeGuess === null}
              onClick={handleStage1}
              className="mt-5 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
            >
              Dalej →
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="mt-5"
          >
            <p className="text-center font-display text-base font-bold text-foreground">
              Wydaj <span className="text-primary">{round.change} zł</span> reszty
              jak najmniejszą liczbą banknotów i monet.
            </p>

            {/* Tray reszty */}
            <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span className="text-muted-foreground">SZUFLADA</span>
                <span className="text-foreground">
                  <strong>{sum}</strong> / {round.change} zł
                  {remaining > 0 && (
                    <span className="ml-2 text-primary">brakuje {remaining}</span>
                  )}
                </span>
              </div>
              <div className="flex min-h-[60px] flex-wrap gap-2">
                <AnimatePresence>
                  {picks.length === 0 && (
                    <div className="m-auto font-mono text-xs text-muted-foreground">
                      kliknij nominały poniżej ↓
                    </div>
                  )}
                  {picks.map((d, i) => (
                    <motion.button
                      key={`${i}-${d}`}
                      layout
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      onClick={() => removePick(i)}
                      title="Kliknij aby usunąć"
                    >
                      <Denomination value={d} small />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Paleta nominałów */}
            <div className="mt-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Dostępne nominały
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {DENOMS.map((d) => (
                  <button
                    key={d}
                    onClick={() => addPick(d)}
                    disabled={sum + d > round.change}
                    className="transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Denomination value={d} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                onClick={reset}
                disabled={picks.length === 0}
                className="h-14 rounded-2xl font-display font-black"
              >
                ↺ Reset
              </Button>
              <Button
                disabled={sum !== round.change}
                onClick={handleStage2}
                className="h-14 flex-1 rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
              >
                Wydaj resztę
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StageDot = ({ active, done, label }: { active: boolean; done: boolean; label: string }) => (
  <div
    className={[
      "rounded-full px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider transition-colors",
      done
        ? "bg-success/20 text-success"
        : active
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-muted-foreground",
    ].join(" ")}
  >
    {done ? "✓ " : ""}{label}
  </div>
);

const Banknote = ({ value }: { value: 50 }) => (
  <div className="inline-flex h-12 w-20 items-center justify-center rounded-md border-2 border-rose-600/40 bg-gradient-to-br from-rose-300 to-rose-400 font-display text-xl font-black text-rose-900 shadow-bouncy">
    {value} zł
  </div>
);

const Denomination = ({ value, small }: { value: Denom; small?: boolean }) => {
  const s = DENOM_STYLE[value];
  if (s.kind === "note") {
    return (
      <div
        className={[
          "inline-flex items-center justify-center rounded-md border-2 border-black/20 bg-gradient-to-br font-display font-black shadow-bouncy",
          s.cls,
          small ? "h-9 w-14 text-sm" : "h-11 w-16 text-base",
        ].join(" ")}
      >
        {s.label}
      </div>
    );
  }
  return (
    <div
      className={[
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br ring-2 font-display font-black shadow-coin",
        s.cls,
        small ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm",
      ].join(" ")}
    >
      {value}
    </div>
  );
};
