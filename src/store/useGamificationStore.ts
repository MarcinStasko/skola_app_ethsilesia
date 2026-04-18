import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Global economy + progression store for SKO-LA.
 *
 * Persisted in localStorage so a child's progress survives reloads.
 * Why Zustand: zero boilerplate, no context re-render storms, and the
 * `persist` middleware gives us streak/coin durability for free.
 */

export type GradeMode = "junior" | "cyber";
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  earnedAt: number;
}

interface GamificationState {
  // --- Identity ---
  username: string | null;
  grade: Grade | null;
  mode: GradeMode;            // derived from grade but stored for fast theming
  onboarded: boolean;

  // --- Economy ---
  coins: number;              // SKO Coins
  xp: number;
  level: number;              // derived: floor(xp / 100) + 1, but cached

  // --- Streak ---
  streak: number;
  lastActiveDay: string | null; // ISO date (YYYY-MM-DD)

  // --- Collections ---
  badges: Badge[];
  completedLessons: string[]; // lesson IDs

  // --- Actions ---
  completeOnboarding: (username: string, grade: Grade) => void;
  setGrade: (grade: Grade) => void;
  awardCoins: (amount: number) => void;
  awardXp: (amount: number) => void;
  registerActivity: () => void; // call on app open / lesson completion
  earnBadge: (badge: Omit<Badge, "earnedAt">) => void;
  markLessonComplete: (lessonId: string) => void;
  reset: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const daysBetween = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
};

const gradeToMode = (g: Grade): GradeMode => (g <= 3 ? "junior" : "cyber");

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      username: null,
      grade: null,
      mode: "junior",
      onboarded: false,

      coins: 0,
      xp: 0,
      level: 1,

      streak: 0,
      lastActiveDay: null,

      badges: [],
      completedLessons: [],

      completeOnboarding: (username, grade) =>
        set({
          username,
          grade,
          mode: gradeToMode(grade),
          onboarded: true,
          // Welcome bonus — every new saver opens an account with starter capital
          coins: 50,
          streak: 1,
          lastActiveDay: todayISO(),
        }),

      setGrade: (grade) => set({ grade, mode: gradeToMode(grade) }),

      awardCoins: (amount) => set({ coins: get().coins + amount }),

      awardXp: (amount) => {
        const xp = get().xp + amount;
        const level = Math.floor(xp / 100) + 1;
        set({ xp, level });
      },

      /**
       * Streak logic:
       *  - Same day: no-op.
       *  - +1 day: streak++ (compound interest, baby).
       *  - >1 day gap: streak resets to 1 (capital lost).
       */
      registerActivity: () => {
        const today = todayISO();
        const last = get().lastActiveDay;
        if (last === today) return;
        if (!last) return set({ streak: 1, lastActiveDay: today });
        const gap = daysBetween(last, today);
        if (gap === 1) set({ streak: get().streak + 1, lastActiveDay: today });
        else if (gap > 1) set({ streak: 1, lastActiveDay: today });
      },

      earnBadge: (badge) => {
        if (get().badges.some((b) => b.id === badge.id)) return;
        set({ badges: [...get().badges, { ...badge, earnedAt: Date.now() }] });
      },

      markLessonComplete: (lessonId) => {
        if (get().completedLessons.includes(lessonId)) return;
        set({ completedLessons: [...get().completedLessons, lessonId] });
      },

      reset: () =>
        set({
          username: null, grade: null, mode: "junior", onboarded: false,
          coins: 0, xp: 0, level: 1, streak: 0, lastActiveDay: null,
          badges: [], completedLessons: [],
        }),
    }),
    { name: "sko-la-state" }
  )
);
