import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminTeamsClient from "@/components/admin/teams/AdminTeamsClient";

export default async function AdminTeamsPage() {
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

  const [{ data: teams, error: teamsError }, { data: players, error: playersError }] =
    await Promise.all([
      supabase
        .from("teams")
        .select(`
          id,
          name,
          created_at,
          updated_at,
          team_players (
            id,
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

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (playersError) {
    throw new Error(playersError.message);
  }

  return (
    <AdminTeamsClient
      initialTeams={teams ?? []}
      initialPlayers={players ?? []}
    />
  );
}