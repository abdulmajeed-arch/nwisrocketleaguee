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
      stage,
      team_a_score,
      team_b_score,
      team_a:teams!matches_team_a_id_fkey (
        id,
        name
      ),
      team_b:teams!matches_team_b_id_fkey (
        id,
        name
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
      stage: match.stage ?? "league",
      scoreA: match.status === "completed"
        ? match.team_a_score ?? 0
        : 0,
      scoreB: match.status === "completed"
        ? match.team_b_score ?? 0
        : 0,
    };
  });

  return <MatchesClient matches={matches} />;
}