"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ProtectedPage from "@/components/ProtectedPage";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/utils/auth";

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return;
      }

      setUser(currentUser);

      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      setProfile((userProfile as UserProfile | null) ?? null);
    };

    void loadProfile();
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            Account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your sign-in and access details for Application Tracker.
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="mt-1 break-words font-medium">{user?.email || "Loading..."}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Role</dt>
              <dd className="mt-1 font-medium">{profile?.role || "Loading..."}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Access</dt>
              <dd className="mt-1 font-medium">
                {profile ? (profile.approved ? "Enabled" : "Revoked") : "Loading..."}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Account created</dt>
              <dd className="mt-1 font-medium">
                {profile ? new Date(profile.created_at).toLocaleDateString() : "Loading..."}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfileContent />
    </ProtectedPage>
  );
}
