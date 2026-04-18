"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-black pt-20 pb-20 px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="p-6 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded">
          <h1 className="text-2xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Access Denied
          </h1>
          <p className="text-yellow-700 dark:text-yellow-300">
            Your account exists, but access to the tracker is currently disabled.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Please contact an administrator if you think this is a mistake.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

