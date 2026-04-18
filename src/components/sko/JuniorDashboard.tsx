import { motion } from "framer-motion";
import { useEffect } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { SkoCoin } from "./SkoCoin";
import { MascotGuide } from "./MascotGuide";
import { useMascotGuide } from "@/hooks/useMascotGuide";

/**
 * Junior Saver dashboard — colorful "island map" of lessons.
 * Each grade gets a row of bouncy nodes (themes) that the student walks
 * through. Phase 4 will wire the first node to the real exercise engine.
 */
const ISLANDS = [
  { id: "g1-piggy-bank",    grade: 1, title: "Wrzuć do Skarbonki",    subtitle: "Liczenie monet do 12",      emoji: "🐷", reward: 15, unlocked: true },
  { id: "g1-pocket-money",  grade: 1, title: "Tydzień Kieszonkowego", subtitle: "Dni tygodnia + dodawanie",  emoji: "📅", reward: 15, unlocked: true },
  { id: "g2-coin-exchange", grade: 2, title: "Rozmieniarka",          subtitle: "Mnożenie monet",            emoji: "💱", reward: 20, unlocked: true },
  { id: "g2-gold-bars",     grade: 2, title: "Sztabki Złota",         subtitle: "Odejmowanie · waga",        emoji: "🏆", reward: 20, unlocked: true },
  { id: "g3-trip-budget",   grade: 3, title: "Budżet Wycieczki",      subtitle: "Tabliczka mnożenia",        emoji: "🚌", reward: 25, unlocked: true },
  { id: "g3-change-atm",    grade: 3, title: "Bankomat Reszta",       subtitle: "Dzielenie + reszta z 50 zł", emoji: "🏧", reward: 25, unlocked: true },
];

export const JuniorDashboard = ({ onStartLesson }: { onStartLesson: (id: string) => void }) => {
  const { username, grade } = useGamificationStore();
  const { tip, show, dismiss } = useMascotGuide();

  useEffect(() => {
    const id = setTimeout(() => {
      show(`Cześć ${username}! Dziś zacznij od „Wrzuć do Skarbonki" — zarobisz 15 SKO 🐷`);
    }, 900);
    return () => clearTimeout(id);
  }, [username, show]);

  return (
    <div className="relative bg-gradient-sky">
      <div className="container max-w-5xl py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl drop-shadow-md"
          >
            🐷
          </motion.div>
          <div>
            <h1 className="font-display text-3xl font-black text-primary sm:text-4xl">
              Cześć, {username}!
            </h1>
            <p className="text-muted-foreground">
              Skarbonka mówi: <strong className="text-foreground">dzisiaj zarobisz nowe monety!</strong>
            </p>
          </div>
        </motion.div>

        {/* Island map */}
        <div className="relative">
          {/* Curvy path (decorative) */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d="M 10 8 Q 60 18, 30 32 T 70 56 T 25 80"
              fill="none"
              stroke="hsl(var(--primary) / 0.25)"
              strokeWidth="0.6"
              strokeDasharray="1.2 1.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative grid gap-5 sm:grid-cols-2">
            {ISLANDS.map((island, i) => {
              const isCurrent = grade === island.grade && i === 0;
              return (
                <motion.button
                  key={island.id}
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  whileHover={island.unlocked ? { scale: 1.03, rotate: -1 } : {}}
                  whileTap={island.unlocked ? { scale: 0.97 } : {}}
                  disabled={!island.unlocked}
                  onClick={() => island.unlocked && onStartLesson(island.id)}
                  className={[
                    "group relative overflow-hidden rounded-3xl p-6 text-left shadow-bouncy transition-opacity",
                    island.unlocked ? "bg-card" : "bg-muted opacity-60",
                    isCurrent && "ring-4 ring-primary",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-5xl">{island.emoji}</div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-display text-xs font-bold text-secondary-foreground">
                      Klasa {island.grade}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-black">{island.title}</h3>
                  <p className="text-sm text-muted-foreground">{island.subtitle}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-coin-foreground">
                      <SkoCoin size={20} />
                      <span>+{island.reward}</span>
                    </div>
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                      {island.unlocked ? "Zagraj →" : "🔒 Zamknięte"}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <MascotGuide
        tip={tip}
        onDismiss={dismiss}
        anchor="bottom-right"
        autoDismissMs={9000}
        action={{
          label: "Zagrajmy! →",
          onClick: () => { dismiss(); onStartLesson("g1-piggy-bank"); },
        }}
      />
    </div>
  );
};
