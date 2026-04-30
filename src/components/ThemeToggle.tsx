"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />;

  const isDark = theme?.endsWith("dark") || theme === "dark";
  const baseTheme = theme === "dark" ? "light" : theme?.replace("-dark", "") || "classic";

  const cycleColor = () => {
    let nextColor = "classic";
    if (baseTheme === "light") nextColor = "classic";
    else if (baseTheme === "classic") nextColor = "ocean-blue";
    else nextColor = "light";
    
    setTheme(isDark ? (nextColor === "light" ? "dark" : `${nextColor}-dark`) : nextColor);
  };

  const toggleDark = () => {
    if (isDark) {
      setTheme(baseTheme);
    } else {
      setTheme(baseTheme === "light" ? "dark" : `${baseTheme}-dark`);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-0.5 shadow-sm">
      <button
        onClick={cycleColor}
        className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
        aria-label="Toggle theme color"
        title={
          baseTheme === "light"
            ? "Purple Theme"
            : baseTheme === "classic"
            ? "Green Theme"
            : "Blue Theme"
        }
      >
        <span className={`w-3.5 h-3.5 rounded-full block transition-colors duration-300 ${baseTheme === "light" ? "bg-[#9333ea]" : baseTheme === "classic" ? "bg-[#16a34a]" : "bg-[#000080]"}`} />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-600" />

      <button
        onClick={toggleDark}
        className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center text-slate-500 dark:text-slate-400"
        aria-label="Toggle dark mode"
        title="Toggle Dark Mode"
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </div>
  );
}
