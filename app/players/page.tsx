import { createClient } from "@/lib/supabase/server";
import PlayersClient from "@/components/players/PlayersClient";

export default async function PlayersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      photo_url,
      grade,
      section,
      nationality,
      rocket_league_rank,
      team_players (
        teams (
          id,
          name
        )
      )
    `)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Players page error:", error);
  }

  const players = (data ?? []).map((player) => {
    const teamPlayer = Array.isArray(player.team_players)
      ? player.team_players[0]
      : player.team_players;

    const team =
      teamPlayer &&
      "teams" in teamPlayer &&
      teamPlayer.teams
        ? Array.isArray(teamPlayer.teams)
          ? teamPlayer.teams[0]
          : teamPlayer.teams
        : null;

    return {
      id: player.id,
      fullName: player.full_name,
      photoUrl: player.photo_url,
      grade: player.grade,
      section: player.section,
      nationality: player.nationality,
      rank: player.rocket_league_rank,
      team: team
        ? {
            id: team.id,
            name: team.name,
          }
        : null,
    };
  });

  return <PlayersClient players={players} />;
}