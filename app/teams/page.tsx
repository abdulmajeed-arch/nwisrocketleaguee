import TeamsClient from "@/components/teams/TeamsClient";
import { createClient } from "@/lib/supabase/server";

export default async function TeamsPage() {
  const supabase = await createClient();

  const [
    { data: teams, error: teamsError },
    { data: matches, error: matchesError },
  ] = await Promise.all([
    supabase
      .from("teams")
      .select(`
        id,
        name,
        team_players (
          players (
            id,
            full_name,
            photo_url,
            grade,
            section,
            nationality,
            rocket_league_rank
          )
        )
      `)
      .order("name", { ascending: true }),

    supabase
      .from("matches")
      .select(`
        id,
        team_a_id,
        team_b_id,
        status
      `),
  ]);

  if (teamsError) {
    console.error("Teams page error:", teamsError);
  }

  if (matchesError) {
    console.error("Teams matches error:", matchesError);
  }

  const teamData = (teams ?? []).map((team) => {
    const teamPlayers = (team.team_players ?? []).flatMap((entry) => {
      const player = Array.isArray(entry.players)
        ? entry.players[0]
        : entry.players;

      if (!player) return [];

      return [
        {
          id: player.id,
          fullName: player.full_name,
          photoUrl: player.photo_url,
          grade: player.grade,
          section: player.section,
          nationality: player.nationality,
          rank: player.rocket_league_rank,
        },
      ];
    });

    const teamMatches = (matches ?? []).filter(
      (match) =>
        match.team_a_id === team.id ||
        match.team_b_id === team.id
    );

    return {
      id: team.id,
      name: team.name,
      players: teamPlayers,
      matches: teamMatches.length,
    };
  });

  return <TeamsClient teams={teamData} />;
}