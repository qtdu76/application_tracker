import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

    if (id === user.id) {
      return NextResponse.json({ error: "You cannot change your own access" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: targetProfile, error: targetError } = await supabase
      .from("user_profiles")
      .select("id, role")
      .eq("id", id)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetProfile.role === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be revoked" }, { status: 400 });
    }

    const body = (await req.json()) as { approved?: unknown };
    if (typeof body.approved !== "boolean") {
      return NextResponse.json({ error: "approved must be a boolean" }, { status: 400 });
    }

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

export async function DELETE(
  _req: Request,
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

    if (id === user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: targetProfile, error: targetError } = await supabase
      .from("user_profiles")
      .select("id, role")
      .eq("id", id)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetProfile.role === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be deleted" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.auth.admin.deleteUser(id);

    if (error) {
      console.error("Error deleting auth user:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected admin user delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
