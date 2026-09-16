import { createClient } from "@/lib/supabase/server";
import StatsClient from "@/components/stats/StatsClient";

export default async function StatsPage() {
  const supabase = await createClient();

  const [
    { data: players, error: playersError },
    { data: teams, error: teamsError },
    { data: teamPlayers, error: teamPlayersError },
    { data: matches, error: matchesError },
    { data: playerStats, error: playerStatsError },
  ] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, photo_url, rocket_league_rank"),

    supabase
      .from("teams")
      .select("id, name")
      .order("name", { ascending: true }),

    supabase
      .from("team_players")
      .select("team_id, player_id"),

    supabase
      .from("matches")
      .select("id, status"),

    supabase
      .from("match_player_stats")
      .select(`
        match_id,
        player_id,
        goals,
        assists,
        saves,
        shots
      `),
  ]);

  if (playersError) {
    console.error("Stats players error:", playersError);
  }

  if (teamsError) {
    console.error("Stats teams error:", teamsError);
  }

  if (teamPlayersError) {
    console.error("Stats team players error:", teamPlayersError);
  }

  if (matchesError) {
    console.error("Stats matches error:", matchesError);
  }

  if (playerStatsError) {
    console.error("Stats player stats error:", playerStatsError);
  }

  const playerMap = new Map(
    (players ?? []).map((player) => [player.id, player])
  );

  const teamMap = new Map(
    (teams ?? []).map((team) => [team.id, team])
  );

  const playerTeamMap = new Map<string, string>();

  for (const entry of teamPlayers ?? []) {
    playerTeamMap.set(entry.player_id, entry.team_id);
  }

  const completedMatchIds = new Set(
    (matches ?? [])
      .filter((match) => match.status === "completed")
      .map((match) => match.id)
  );

  const statsMap = new Map<
    string,
    {
      matches: Set<string>;
      goals: number;
      assists: number;
      saves: number;
      shots: number;
    }
  >();

  for (const stat of playerStats ?? []) {
    if (!completedMatchIds.has(stat.match_id)) {
      continue;
    }

    if (!statsMap.has(stat.player_id)) {
      statsMap.set(stat.player_id, {
        matches: new Set(),
        goals: 0,
        assists: 0,
        saves: 0,
        shots: 0,
      });
    }

    const current = statsMap.get(stat.player_id)!;

    current.matches.add(stat.match_id);
    current.goals += stat.goals ?? 0;
    current.assists += stat.assists ?? 0;
    current.saves += stat.saves ?? 0;
    current.shots += stat.shots ?? 0;
  }

  const playerStatsData = (players ?? [])
    .map((player) => {
      const stats = statsMap.get(player.id);

      const teamId = playerTeamMap.get(player.id);
      const team = teamId ? teamMap.get(teamId) : null;

      return {
        id: player.id,
        name: player.full_name,
        photoUrl: player.photo_url,
        rank: player.rocket_league_rank,
        team: team
          ? {
              id: team.id,
              name: team.name,
            }
          : null,
        matches: stats?.matches.size ?? 0,
        goals: stats?.goals ?? 0,
        assists: stats?.assists ?? 0,
        saves: stats?.saves ?? 0,
        shots: stats?.shots ?? 0,
      };
    })
    .filter((player) => player.matches > 0);

  const completedMatches = (matches ?? []).filter(
    (match) => match.status === "completed"
  ).length;

  const totalGoals = playerStatsData.reduce(
    (sum, player) => sum + player.goals,
    0
  );

  const totalAssists = playerStatsData.reduce(
    (sum, player) => sum + player.assists,
    0
  );

  const totalSaves = playerStatsData.reduce(
    (sum, player) => sum + player.saves,
    0
  );

  return (
    <StatsClient
      playerStats={playerStatsData}
      overview={{
        matches: completedMatches,
        goals: totalGoals,
        assists: totalAssists,
        saves: totalSaves,
      }}
    />
  );
}