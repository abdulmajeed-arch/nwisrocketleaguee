import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminMatchesClient from "@/components/admin/matches/AdminMatchesClient";

export default async function AdminMatchesPage() {
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
    { data: matches, error: matchesError },
    { data: teams, error: teamsError },
    { data: players, error: playersError },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(`
        id,
        scheduled_at,
        status,
        stage,
        team_a_id,
        team_b_id,
        team_a_score,
        team_b_score,
        teams_a:teams!matches_team_a_id_fkey (
          id,
          name
        ),
        teams_b:teams!matches_team_b_id_fkey (
          id,
          name
        ),
        match_player_stats (
          id,
          player_id,
          goals,
          assists,
          saves,
          shots
        )
      `)
      .order("scheduled_at", { ascending: true }),

    supabase
      .from("teams")
      .select(`
        id,
        name,
        team_players (
          player_id,
          players (
            id,
            full_name,
            photo_url,
            grade,
            section,
            rocket_league_rank
          )
        )
      `)
      .order("name", { ascending: true }),

    supabase
      .from("players")
      .select(`
        id,
        full_name,
        photo_url,
        grade,
        section,
        rocket_league_rank
      `)
      .order("full_name", { ascending: true }),
  ]);

  if (matchesError) {
    throw new Error(matchesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (playersError) {
    throw new Error(playersError.message);
  }

  return (
    <AdminMatchesClient
      initialMatches={matches ?? []}
      initialTeams={teams ?? []}
      initialPlayers={players ?? []}
    />
  );
}