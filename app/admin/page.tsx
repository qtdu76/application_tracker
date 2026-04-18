"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/utils/auth";

interface UserWithProfile {
  id: string;
  email: string;
  approved: boolean;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

function AdminContent() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch users");
    }

    setUsers(data as UserWithProfile[]);
  };

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login?redirect=/admin");
          return;
        }

        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!userProfile || userProfile.role !== "admin") {
          router.push("/");
          return;
        }

        setProfile(userProfile as UserProfile);
        setCurrentUserId(user.id);
        await fetchUsers();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load admin panel");
      } finally {
        setLoading(false);
      }
    };

    void loadAdmin();
  }, [router]);

  const handleApprovalChange = async (userId: string, approved: boolean) => {
    try {
      setUpdating(userId);
      setError(null);

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId ? (data as UserWithProfile) : currentUser,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    const confirmed = window.confirm(
      `Delete ${email}? This removes the Supabase Auth user and lets the email sign up again.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(`delete:${userId}`);
      setError(null);

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== userId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete user");
    } finally {
      setUpdating(null);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 px-4 py-16 dark:bg-black">
        <div className="mx-auto max-w-5xl text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  const revokedUsers = users.filter((user) => !user.approved);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">User access</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review users and revoke or restore tracker access.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-2xl font-semibold">{users.length}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total users</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-2xl font-semibold">{revokedUsers.length}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Access revoked</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-2xl font-semibold">
              {users.filter((user) => user.approved).length}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Access enabled</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Email</th>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Role</th>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Signed up</th>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isProtectedAccount = user.role === "admin" || user.id === currentUserId;
                const isUpdatingApproval = updating === user.id;
                const isDeleting = updating === `delete:${user.id}`;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                  >
                    <td className="px-4 py-3 font-medium">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          user.approved
                            ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                        }`}
                      >
                        {user.approved ? "Enabled" : "Revoked"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {isProtectedAccount ? (
                        <span className="text-sm text-zinc-500 dark:text-zinc-500">
                          Protected
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprovalChange(user.id, !user.approved)}
                            disabled={Boolean(updating)}
                            className={`rounded-md px-3 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              user.approved
                                ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                : "bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-300 dark:text-zinc-950 dark:hover:bg-cyan-200"
                            }`}
                          >
                            {isUpdatingApproval
                              ? "Updating..."
                              : user.approved
                                ? "Revoke"
                                : "Restore"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={Boolean(updating)}
                            className="rounded-md bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-400"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 ? (
            <div className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-400">
              No users yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedPage>
      <AdminContent />
    </ProtectedPage>
  );
}
