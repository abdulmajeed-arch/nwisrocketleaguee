import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: players, error: playersError },
    { data: teams, error: teamsError },
    { data: matches, error: matchesError },
    { data: highlights, error: highlightsError },
  ] = await Promise.all([
    supabase.from("players").select("id"),
    supabase.from("teams").select("id"),
    supabase
      .from("matches")
      .select("id, team_a_id, team_b_id, scheduled_at, status")
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("highlights")
      .select(
        "id, match_id, title, description, video_url, thumbnail_url, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  if (playersError) {
    console.error("Homepage players error:", playersError);
  }

  if (teamsError) {
    console.error("Homepage teams error:", teamsError);
  }

  if (matchesError) {
    console.error("Homepage matches error:", matchesError);
  }

  if (highlightsError) {
    console.error("Homepage highlights error:", highlightsError);
  }

  return (
    <HomeClient
      players={players ?? []}
      teams={teams ?? []}
      matches={matches ?? []}
      highlights={highlights ?? []}
    />
  );
}