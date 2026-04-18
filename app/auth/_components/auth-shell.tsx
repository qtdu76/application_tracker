import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  eyebrow: string;
  children: ReactNode;
  footer: ReactNode;
}

const highlights = [
  "Keep every application, contact, note, and document in one place.",
  "Move applications through stages without losing the next step.",
  "Store private job-search data behind your own Supabase project.",
];

export function AuthShell({ title, subtitle, eyebrow, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
              {eyebrow}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Track the search without letting it run your life.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Application Tracker gives your job search a calm home: roles, deadlines, contacts,
              notes, CVs, cover letters, and outcomes.
            </p>
          </div>

          <div className="grid gap-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {highlight}
              </div>
            ))}
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            New accounts get access immediately. Admins can revoke access from the admin panel.
          </p>
        </section>

        <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 border-t border-zinc-200 pt-5 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            {footer}
          </div>
        </section>
      </div>

      <div className="mx-auto mt-8 max-w-6xl text-center text-xs text-zinc-500 dark:text-zinc-500">
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
