"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { AuthShell } from "../_components/auth-shell";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=/`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (authError) {
        setError(authError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError("Google signup could not be started.");
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        eyebrow="You are in"
        title="Account created"
        subtitle="Your account is ready. You can sign in and start using the tracker."
        footer={
          <Link href="/auth/login" className="font-medium text-cyan-700 hover:underline dark:text-cyan-300">
            Go to login
          </Link>
        }
      >
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          You can sign in now. Admins can revoke access later if needed.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Start organized"
      title="Create an account"
      subtitle="Create an account and start building a cleaner view of your job search."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-cyan-700 hover:underline dark:text-cyan-300">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-zinc-200 bg-white px-4 py-3 font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          <FcGoogle className="h-5 w-5" aria-hidden="true" />
          {googleLoading ? "Opening Google..." : "Sign up with Google"}
        </button>

        <div className="flex items-center gap-3 text-xs uppercase text-zinc-400 dark:text-zinc-600">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          or use email
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-950 outline-none transition focus:border-cyan-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-950 outline-none transition focus:border-cyan-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-950 outline-none transition focus:border-cyan-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="Repeat your password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-cyan-300 dark:text-zinc-950 dark:hover:bg-cyan-200"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
