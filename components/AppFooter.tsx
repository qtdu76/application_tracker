"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("application-tracker-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("application-tracker-theme", theme);
}

export default function AppFooter() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const themeTimer = window.setTimeout(() => {
      setTheme(getInitialTheme());
    }, 0);

    return () => {
      window.clearTimeout(themeTimer);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-3 sm:items-center sm:px-6 lg:px-8">
        <p className="text-center sm:text-left">Application Tracker</p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 min-w-20 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <>
                <MdLightMode className="h-5 w-5" aria-hidden="true" />
                Light
              </>
            ) : (
              <>
                <MdDarkMode className="h-5 w-5" aria-hidden="true" />
                Dark
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 sm:justify-end">
          <Link href="/privacy" className="transition hover:text-zinc-950 dark:hover:text-zinc-50">
            Privacy
          </Link>
          <Link href="/" className="transition hover:text-zinc-950 dark:hover:text-zinc-50">
            Tracker
          </Link>
        </div>
      </div>
    </footer>
  );
}
