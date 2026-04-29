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

  const cycleTheme = () => {
    if (theme === "light") setTheme("classic");
    else if (theme === "classic") setTheme("true-classic");
    else if (theme === "true-classic") setTheme("ocean-blue");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center border border-slate-200 shadow-sm"
      aria-label="Toggle theme"
      title={
        theme === "light"
          ? "Purple Theme"
          : theme === "classic"
          ? "Classic Theme (Green)"
          : theme === "true-classic"
          ? "True Classic (Grayscale)"
          : "Ocean Blue Theme"
      }
    >
      <span className="w-4 h-4 rounded-full bg-primary-900 block transition-colors duration-300" />
    </button>
  );
}
