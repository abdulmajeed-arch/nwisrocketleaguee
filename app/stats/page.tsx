import { createClient } from "@/lib/supabase/server";
import StatsClient from "@/components/stats/StatsClient";

type Standing = {
  id: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

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
      .select(`
        id,
        team_a_id,
        team_b_id,
        team_a_score,
        team_b_score,
        status
      `),

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

  // ------------------------------------------------------------
  // TEAM / PLAYER MAPS
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // LEAGUE STANDINGS
  // ------------------------------------------------------------

  const standingsMap = new Map<string, Standing>();

  for (const team of teams ?? []) {
    standingsMap.set(team.id, {
      id: team.id,
      name: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    });
  }

  const completedMatches = (matches ?? []).filter(
    (match) => match.status === "completed"
  );

  for (const match of completedMatches) {
    const teamA = standingsMap.get(match.team_a_id);
    const teamB = standingsMap.get(match.team_b_id);

    if (!teamA || !teamB) {
      continue;
    }

    const teamAScore = match.team_a_score ?? 0;
    const teamBScore = match.team_b_score ?? 0;

    // Games played
    teamA.played += 1;
    teamB.played += 1;

    // Goals for / against
    teamA.gf += teamAScore;
    teamA.ga += teamBScore;

    teamB.gf += teamBScore;
    teamB.ga += teamAScore;

    // Win / loss + league points
    if (teamAScore > teamBScore) {
      teamA.wins += 1;
      teamA.points += 1;

      teamB.losses += 1;
    } else if (teamBScore > teamAScore) {
      teamB.wins += 1;
      teamB.points += 1;

      teamA.losses += 1;
    }
  }

  // Calculate goal difference
  for (const team of standingsMap.values()) {
    team.gd = team.gf - team.ga;
  }

  // Sort:
  // 1. Points
  // 2. Goal Difference
  // 3. Goals For
  // 4. Team name
  const standings = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.gd !== a.gd) {
      return b.gd - a.gd;
    }

    if (b.gf !== a.gf) {
      return b.gf - a.gf;
    }

    return a.name.localeCompare(b.name);
  });

  // Add position
  const standingsData = standings.map((team, index) => ({
    ...team,
    position: index + 1,
  }));

  // ------------------------------------------------------------
  // PLAYER STATISTICS
  // ------------------------------------------------------------

  const completedMatchIds = new Set(
    completedMatches.map((match) => match.id)
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

  // ------------------------------------------------------------
  // OVERVIEW
  // ------------------------------------------------------------

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
      standings={standingsData}
      overview={{
        matches: completedMatches.length,
        goals: totalGoals,
        assists: totalAssists,
        saves: totalSaves,
      }}
    />
  );
}