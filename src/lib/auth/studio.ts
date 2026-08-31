import "server-only";

import { notFound } from "next/navigation";

import { requireViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export async function requireStudioAccess() {
  const viewer = await requireViewer("/studio");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("has_studio_access");
  if (error || !data) notFound();
  return viewer;
}
