import { useState } from "react";
import { motion } from "framer-motion";
import { useGamificationStore, type Grade } from "@/store/useGamificationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkoCoin } from "./SkoCoin";
import logo from "@/assets/sko-la-logo.png";

const GRADES: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * First-run flow: pick a name + grade. The grade choice locks in either
 * the Junior Saver or Cyber Banker visual paradigm. We render onboarding
 * with the JUNIOR token set forced via wrapper styling so the picker
 * itself doesn't shapeshift mid-selection.
 */
export const Onboarding = () => {
  const completeOnboarding = useGamificationStore((s) => s.completeOnboarding);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);

  const canSubmit = name.trim().length >= 2 && grade !== null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-sky">
      {/* Floating coins backdrop */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ y: "100vh", x: `${(i * 83) % 100}vw`, opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.6, 0] }}
          transition={{ duration: 12 + (i % 5), repeat: Infinity, delay: i * 0.7, ease: "linear" }}
        >
          <SkoCoin size={24 + (i % 4) * 6} />
        </motion.div>
      ))}

      <div className="container relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center py-10">
        <motion.div
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="mb-4 h-24 w-24 overflow-hidden rounded-3xl bg-card shadow-bouncy"
        >
          <img
            src={logo}
            alt="Logo SKO·LA — Szkolna Kasa Oszczędności PKO Banku Polskiego"
            className="h-full w-full object-contain"
          />
        </motion.div>

        <h1 className="font-display text-5xl font-black tracking-tight text-primary sm:text-6xl">
          SKO<span className="text-destructive">·</span>LA
        </h1>
        <p className="mt-1 font-display text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          PKO Bank Polski · Junior Saver
        </p>
        <p className="mt-2 text-center text-base text-muted-foreground sm:text-lg">
          Matematyka, oszczędzanie i przygoda. Zacznijmy!
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full rounded-3xl bg-card p-6 shadow-bouncy sm:p-8"
        >
          <label className="mb-2 block font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Jak masz na imię?
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Zosia"
            maxLength={16}
            className="h-14 rounded-2xl border-2 text-lg font-bold"
          />

          <div className="mt-6 mb-2 flex items-end justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Do której chodzisz klasy?
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map((g) => {
              const selected = grade === g;
              const cyber = g >= 4;
              return (
                <motion.button
                  key={g}
                  onClick={() => setGrade(g)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className={[
                    "relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 font-display font-black transition-colors",
                    selected
                      ? cyber
                        ? "border-foreground bg-foreground text-background"
                        : "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary/40 text-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  <span className="text-2xl">{g}</span>
                  <span className="mt-0.5 text-[9px] uppercase tracking-wider opacity-70">
                    {cyber ? "Cyber" : "Junior"}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Klasy 1–3 grają w trybie <strong className="text-primary">Junior Saver</strong>.
            Klasy 4–8 odblokują <strong className="text-foreground">Cyber Banker</strong>.
          </p>

          <Button
            disabled={!canSubmit}
            onClick={() => grade && completeOnboarding(name.trim(), grade)}
            className="mt-6 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy hover:opacity-90 disabled:opacity-40"
          >
            Otwórz konto SKO 🐷
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
