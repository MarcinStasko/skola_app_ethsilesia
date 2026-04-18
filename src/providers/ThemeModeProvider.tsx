import { useEffect } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";

/**
 * Syncs the active GradeMode to <html data-mode="…"> so CSS variables in
 * index.css cascade the entire visual paradigm. Cyber mode also gets the
 * `dark` class for any shadcn components that key off it.
 */
export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const mode = useGamificationStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-mode", mode);
    root.classList.toggle("dark", mode === "cyber");
  }, [mode]);

  return <>{children}</>;
};
