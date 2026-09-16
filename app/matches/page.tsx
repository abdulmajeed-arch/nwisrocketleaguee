import { createClient } from "@/lib/supabase/server";
import MatchesClient from "@/components/matches/MatchesClient";

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      team_a_id,
      team_b_id,
      scheduled_at,
      status,
      team_a:teams!matches_team_a_id_fkey (
        id,
        name
      ),
      team_b:teams!matches_team_b_id_fkey (
        id,
        name
      ),
      match_player_stats (
        player_id,
        goals
      )
    `)
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Matches page error:", error);
  }

  const matches = (data ?? []).map((match) => {
    const teamA = Array.isArray(match.team_a)
      ? match.team_a[0]
      : match.team_a;

    const teamB = Array.isArray(match.team_b)
      ? match.team_b[0]
      : match.team_b;

    let scoreA = 0;
    let scoreB = 0;

    /*
     * We need to know which players belong to each team.
     * This is fetched separately below.
     */

    return {
      id: match.id,
      teamA: teamA
        ? {
            id: teamA.id,
            name: teamA.name,
          }
        : null,
      teamB: teamB
        ? {
            id: teamB.id,
            name: teamB.name,
          }
        : null,
      scheduledAt: match.scheduled_at,
      status: match.status,
      scoreA,
      scoreB,
      stats: match.match_player_stats ?? [],
    };
  });

  /*
   * Get team memberships so completed match scores can
   * be calculated from player goals.
   */
  const { data: teamPlayers, error: teamPlayersError } = await supabase
    .from("team_players")
    .select("team_id, player_id");

  if (teamPlayersError) {
    console.error("Match team players error:", teamPlayersError);
  }

  const playerTeamMap = new Map<string, string>();

  for (const entry of teamPlayers ?? []) {
    playerTeamMap.set(entry.player_id, entry.team_id);
  }

  const finalMatches = matches.map((match) => {
    let scoreA = 0;
    let scoreB = 0;

    for (const stat of match.stats) {
      const teamId = playerTeamMap.get(stat.player_id);

      if (teamId === match.teamA?.id) {
        scoreA += stat.goals ?? 0;
      }

      if (teamId === match.teamB?.id) {
        scoreB += stat.goals ?? 0;
      }
    }

    return {
      id: match.id,
      teamA: match.teamA,
      teamB: match.teamB,
      scheduledAt: match.scheduledAt,
      status: match.status,
      scoreA,
      scoreB,
    };
  });

  return <MatchesClient matches={finalMatches} />;
}