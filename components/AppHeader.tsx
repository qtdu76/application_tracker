"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/utils/auth";

export default function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) {
        setProfile(null);
        return;
      }

      void supabase
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()
        .then(({ data: userProfile }) => {
          setProfile((userProfile as UserProfile | null) ?? null);
        });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAccountOpen(false);

      if (!nextUser) {
        setProfile(null);
        return;
      }

      void supabase
        .from("user_profiles")
        .select("*")
        .eq("id", nextUser.id)
        .single()
        .then(({ data: userProfile }) => {
          setProfile((userProfile as UserProfile | null) ?? null);
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAccountOpen(false);
    router.push("/auth/login");
    router.refresh();
  };

  const isAuthPage = pathname?.startsWith("/auth");
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-lg">
          Application Tracker
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="rounded-md px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                Account
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 rounded-md border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-500">
                      Signed in
                    </p>
                    <p className="mt-1 truncate font-medium text-zinc-950 dark:text-zinc-50">
                      {user.email}
                    </p>
                    {profile ? (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {profile.role === "admin" ? "Admin" : "User"} / {profile.approved ? "Access enabled" : "Access revoked"}
                      </p>
                    ) : null}
                  </div>

                  <div className="py-2">
                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-md px-3 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                    >
                      Profile
                    </Link>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-md px-3 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                      >
                        Admin panel
                      </Link>
                    ) : null}
                  </div>

                  <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full rounded-md px-3 py-2 text-left font-medium text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isAuthPage ? (
                <Link
                  href="/auth/login"
                  className="rounded-md px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
              ) : null}
              {pathname !== "/auth/signup" ? (
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-cyan-600 px-3 py-2 font-medium text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-zinc-950 dark:hover:bg-cyan-200"
                >
                  Sign up
                </Link>
              ) : null}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
