import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminHighlightsClient from "@/components/admin/highlights/AdminHighlightsClient";

export default async function AdminHighlightsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/admin/login");
  }

  const [
    { data: highlights, error: highlightsError },
    { data: matches, error: matchesError },
  ] = await Promise.all([
    supabase
      .from("highlights")
      .select(`
        id,
        match_id,
        title,
        description,
        video_url,
        thumbnail_url,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("matches")
      .select(`
        id,
        scheduled_at,
        status,
        team_a_id,
        team_b_id,
        teams_a:teams!matches_team_a_id_fkey (
          id,
          name
        ),
        teams_b:teams!matches_team_b_id_fkey (
          id,
          name
        )
      `)
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false }),
  ]);

  if (highlightsError) {
    throw new Error(highlightsError.message);
  }

  if (matchesError) {
    throw new Error(matchesError.message);
  }

  return (
    <AdminHighlightsClient
      initialHighlights={highlights ?? []}
      initialMatches={matches ?? []}
    />
  );
}