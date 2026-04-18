"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "@/utils/auth";

interface ProtectedPageProps {
  children: React.ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      // Check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        // Redirect to login with the current path as redirect parameter
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      setUser(currentUser);

      // Check user profile and access status
      const { data: userProfile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId: currentUser.id,
          userEmail: currentUser.email
        });
        // Profile doesn't exist or RLS blocked access
        router.push("/auth/access-denied");
        return;
      }

      if (!userProfile) {
        console.error("User profile not found for user:", currentUser.id);
        router.push("/auth/access-denied");
        return;
      }

      console.log("User profile fetched successfully:", {
        id: userProfile.id,
        email: userProfile.email,
        approved: userProfile.approved,
        role: userProfile.role
      });

      setProfile(userProfile as UserProfile);

      // Check if user access is enabled
      if (!userProfile.approved) {
        router.push("/auth/access-denied");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile || !profile.approved) {
    return null; // Redirect is happening
  }

  return <>{children}</>;
}

