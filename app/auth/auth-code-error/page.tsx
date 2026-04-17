import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 px-4 py-16 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl space-y-4 rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase text-red-700 dark:text-red-300">
          Sign-in failed
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">We could not complete sign-in.</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          The authentication link was missing, expired, or rejected by the provider.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex rounded-md bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-zinc-950 dark:hover:bg-cyan-200"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
