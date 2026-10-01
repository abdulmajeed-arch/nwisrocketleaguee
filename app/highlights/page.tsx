import { createClient } from "@/lib/supabase/server";
import HighlightsClient from "@/components/highlights/HighlightsClient";

export default async function HighlightsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("highlights")
    .select(`
      id,
      match_id,
      title,
      description,
      video_url,
      thumbnail_url,
      created_at,
      matches (
        id,
        team_a_id,
        team_b_id,
        scheduled_at,
        status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Highlights page error:", error);
  }

  const matchIds = [
    ...new Set(
      (data ?? [])
        .map((highlight) => highlight.match_id)
        .filter(Boolean)
    ),
  ];

  let matches: {
    id: string;
    team_a_id: string;
    team_b_id: string;
    scheduled_at: string;
    status: string;
  }[] = [];

  if (matchIds.length > 0) {
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select(`
        id,
        team_a_id,
        team_b_id,
        scheduled_at,
        status
      `)
      .in("id", matchIds);

    if (matchError) {
      console.error("Highlights matches error:", matchError);
    }

    matches = matchData ?? [];
  }

  const teamIds = [
    ...new Set(
      matches.flatMap((match) => [
        match.team_a_id,
        match.team_b_id,
      ])
    ),
  ];

  let teams: {
    id: string;
    name: string;
  }[] = [];

  if (teamIds.length > 0) {
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id, name")
      .in("id", teamIds);

    if (teamError) {
      console.error("Highlights teams error:", teamError);
    }

    teams = teamData ?? [];
  }

  const teamMap = new Map(
    teams.map((team) => [team.id, team])
  );

  const matchMap = new Map(
    matches.map((match) => [match.id, match])
  );

  const highlights = (data ?? []).map((highlight) => {
    const match = matchMap.get(highlight.match_id);

    const teamA = match
      ? teamMap.get(match.team_a_id)
      : null;

    const teamB = match
      ? teamMap.get(match.team_b_id)
      : null;

    return {
      id: highlight.id,
      matchId: highlight.match_id,
      title: highlight.title,
      description: highlight.description,
      videoUrl: highlight.video_url,
      thumbnailUrl: highlight.thumbnail_url,
      createdAt: highlight.created_at,
      match: match
        ? {
            id: match.id,
            scheduledAt: match.scheduled_at,
            status: match.status,
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
          }
        : null,
    };
  });

  return <HighlightsClient highlights={highlights} />;
}