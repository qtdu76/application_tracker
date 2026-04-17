import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUserWithProfile } from "@/utils/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user, profile } = await getCurrentUserWithProfile();

    if (!user || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = (await req.json()) as { approved?: unknown };
    if (typeof body.approved !== "boolean") {
      return NextResponse.json({ error: "approved must be a boolean" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ approved: body.approved })
      .eq("id", id)
      .select("id, email, approved, role, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error updating user approval:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
