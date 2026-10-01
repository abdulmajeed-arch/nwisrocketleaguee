import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Gamepad2,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatNationality } from "@/lib/nationality";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, created_at")
    .eq("id", id)
    .single();

  if (teamError || !team) {
    notFound();
  }

  const { data: teamPlayers } = await supabase
    .from("team_players")
    .select(`
      player_id,
      players (
        id,
        full_name,
        photo_url,
        grade,
        section,
        nationality,
        rocket_league_rank
      )
    `)
    .eq("team_id", id);

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      scheduled_at,
      status,
      team_a_id,
      team_b_id,
      teams_a:teams!matches_team_a_id_fkey (
        id,
        name
      ),
      teams_b:teams!matches_team_b_id_fkey (
        id,
        name
      ),
      match_player_stats (
        player_id,
        goals,
        assists,
        saves,
        shots
      )
    `)
    .or(`team_a_id.eq.${id},team_b_id.eq.${id}`)
    .order("scheduled_at", { ascending: false });

  const completedMatches = (matches ?? []).filter(
    (match) => match.status === "completed"
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of completedMatches) {
    const stats = match.match_player_stats ?? [];

    const teamScore = stats
      .filter((stat) =>
        teamPlayers?.some(
          (player) => player.player_id === stat.player_id
        )
      )
      .reduce((sum, stat) => sum + (stat.goals ?? 0), 0);

    const opponentScore = stats
      .filter(
        (stat) =>
          !teamPlayers?.some(
            (player) => player.player_id === stat.player_id
          )
      )
      .reduce((sum, stat) => sum + (stat.goals ?? 0), 0);

    goalsFor += teamScore;
    goalsAgainst += opponentScore;

    if (teamScore > opponentScore) wins++;
    else if (teamScore < opponentScore) losses++;
    else draws++;
  }

  const teamStats = (teamPlayers ?? []).reduce(
    (acc, item) => {
      const playerStats = (matches ?? [])
        .flatMap((match) => match.match_player_stats ?? [])
        .filter((stat) => stat.player_id === item.player_id);

      for (const stat of playerStats) {
        acc.goals += stat.goals ?? 0;
        acc.assists += stat.assists ?? 0;
        acc.saves += stat.saves ?? 0;
        acc.shots += stat.shots ?? 0;
      }

      return acc;
    },
    {
      goals: 0,
      assists: 0,
      saves: 0,
      shots: 0,
    }
  );

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/teams"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 sm:p-9">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/[0.08] via-transparent to-transparent" />

          <div className="relative">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10">
              <Trophy className="h-7 w-7 text-sky-400" />
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
              {team.name}
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              NWIS Rocket League Tournament
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-black text-white">
              Team Stats
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <StatCard label="Played" value={completedMatches.length} />
            <StatCard label="Wins" value={wins} />
            <StatCard label="Losses" value={losses} />
            <StatCard label="Draws" value={draws} />
            <StatCard label="Goals For" value={goalsFor} />
            <StatCard label="Goals Against" value={goalsAgainst} />
          </div>
        </section>

        {/* Roster */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-black text-white">
                Roster
              </h2>
            </div>

            <span className="text-xs font-bold text-slate-600">
              {teamPlayers?.length ?? 0} Players
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(teamPlayers ?? []).map((item) => {
              const player = Array.isArray(item.players)
                ? item.players[0]
                : item.players;

              if (!player) return null;

              return (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/[0.04]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b101a]">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Gamepad2 className="h-6 w-6 text-slate-700" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate font-black text-white group-hover:text-sky-300">
                      {player.full_name}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      Grade {player.grade}-{player.section}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {player.nationality
                        ? formatNationality(player.nationality)
                        : "Nationality unknown"}
                    </div>
                  </div>

                  <div className="ml-auto shrink-0 rounded-lg border border-sky-400/10 bg-sky-400/[0.04] px-2.5 py-1.5 text-[10px] font-black text-sky-400">
                    {player.rocket_league_rank || "Unranked"}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Aggregate stats */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-black text-white">
              Tournament Totals
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Goals" value={teamStats.goals} />
            <StatCard label="Assists" value={teamStats.assists} />
            <StatCard label="Saves" value={teamStats.saves} />
            <StatCard label="Shots" value={teamStats.shots} />
          </div>
        </section>

        {/* Matches */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-black text-white">
              Matches
            </h2>
          </div>

          <div className="space-y-3">
            {(matches ?? []).map((match) => {
              const teamA = Array.isArray(match.teams_a)
                ? match.teams_a[0]
                : match.teams_a;

              const teamB = Array.isArray(match.teams_b)
                ? match.teams_b[0]
                : match.teams_b;

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all hover:border-sky-400/20 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-bold text-white">
                      {teamA?.name ?? "Team A"}{" "}
                      <span className="mx-2 text-slate-700">vs</span>{" "}
                      {teamB?.name ?? "Team B"}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(match.scheduled_at))}
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
                      match.status === "completed"
                        ? "border border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-400"
                        : "border border-sky-400/10 bg-sky-400/[0.05] text-sky-400"
                    }`}
                  >
                    {match.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 text-3xl font-black text-white">
        {value}
      </div>
    </div>
  );
}