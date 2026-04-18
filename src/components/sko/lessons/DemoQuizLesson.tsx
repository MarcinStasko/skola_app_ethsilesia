import { useState } from "react";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";

/**
 * Tiny demo lesson to prove the engine works. Phase 4 will replace this
 * with the real "Wrzuć do Skarbonki" drag-drop game; until then this
 * lets you exercise the full loop: question → submit → feedback → next.
 */
const QUESTIONS = [
  { q: "2 + 3 = ?",  a: 5,  options: [4, 5, 6, 7] },
  { q: "7 - 2 = ?",  a: 5,  options: [3, 5, 6, 9] },
  { q: "4 + 4 = ?",  a: 8,  options: [6, 7, 8, 10] },
];

export const DemoQuizLesson = ({ onExit }: { onExit: () => void }) => {
  return (
    <ExerciseContainer
      lessonId="demo-quiz"
      title="Pierwsze monety"
      subtitle="Rozgrzewka — silnik ćwiczeń"
      baseReward={10}
      steps={QUESTIONS.length}
      onExit={onExit}
      renderStep={(i, props) => <QuizStep key={i} q={QUESTIONS[i]} {...props} />}
    />
  );
};

const QuizStep = ({
  q, submit,
}: { q: typeof QUESTIONS[number] } & ExerciseStepProps) => {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-3xl bg-card p-8 shadow-bouncy">
      <div className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Pytanie
      </div>
      <h2 className="font-display text-4xl font-black text-primary sm:text-5xl">
        {q.q}
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const selected = picked === opt;
          return (
            <button
              key={opt}
              onClick={() => setPicked(opt)}
              className={[
                "h-16 rounded-2xl border-2 font-display text-2xl font-black transition-all",
                selected
                  ? "border-primary bg-primary text-primary-foreground scale-95"
                  : "border-border bg-secondary/40 hover:bg-secondary",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <Button
        disabled={picked === null}
        onClick={() => submit(picked === q.a, picked === q.a ? undefined : `Poprawna odpowiedź to ${q.a}.`)}
        className="mt-6 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
      >
        Sprawdź
      </Button>
    </div>
  );
};
