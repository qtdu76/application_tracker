import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUserWithProfile } from "@/utils/auth";

export async function GET() {
  try {
    const { user, profile } = await getCurrentUserWithProfile();

    if (!user || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email, approved, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Unexpected admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
