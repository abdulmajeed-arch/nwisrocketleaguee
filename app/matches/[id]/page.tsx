import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Crosshair,
  Gamepad2,
  Shield,
  Target,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match, error } = await supabase
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
        id,
        player_id,
        goals,
        assists,
        saves,
        shots,
        players (
          id,
          full_name,
          photo_url,
          rocket_league_rank
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !match) {
    notFound();
  }

  const teamA = Array.isArray(match.teams_a)
    ? match.teams_a[0]
    : match.teams_a;

  const teamB = Array.isArray(match.teams_b)
    ? match.teams_b[0]
    : match.teams_b;

  const stats = match.match_player_stats ?? [];

  const getPlayer = (item: (typeof stats)[number]) =>
    Array.isArray(item.players) ? item.players[0] : item.players;

  const teamAStats = stats.filter((stat) => {
    const player = getPlayer(stat);

    return (
      player &&
      stats.some(
        (other) =>
          other.player_id === player.id &&
          match.team_a_id === match.team_a_id
      )
    );
  });

  /*
   * The match stats table does not contain team_id.
   * We therefore fetch team memberships to determine
   * which player belongs to which side.
   */
  const playerIds = stats.map((stat) => stat.player_id);

  const { data: memberships } = await supabase
    .from("team_players")
    .select("player_id, team_id")
    .in("player_id", playerIds);

  const teamAPlayerIds = new Set(
    (memberships ?? [])
      .filter((membership) => membership.team_id === match.team_a_id)
      .map((membership) => membership.player_id)
  );

  const teamBPlayerIds = new Set(
    (memberships ?? [])
      .filter((membership) => membership.team_id === match.team_b_id)
      .map((membership) => membership.player_id)
  );

  const teamAPlayerStats = stats.filter((stat) =>
    teamAPlayerIds.has(stat.player_id)
  );

  const teamBPlayerStats = stats.filter((stat) =>
    teamBPlayerIds.has(stat.player_id)
  );

  const scoreA = teamAPlayerStats.reduce(
    (sum, stat) => sum + (stat.goals ?? 0),
    0
  );

  const scoreB = teamBPlayerStats.reduce(
    (sum, stat) => sum + (stat.goals ?? 0),
    0
  );

  const date = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(match.scheduled_at));

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/matches"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </Link>

        {/* Match hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/[0.07] via-transparent to-transparent" />

          <div className="relative p-6 sm:p-10">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                <CalendarDays className="h-4 w-4" />
                {date}
              </div>

              <span
                className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
                  match.status === "completed"
                    ? "border border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-400"
                    : "border border-sky-400/10 bg-sky-400/[0.05] text-sky-400"
                }`}
              >
                {match.status}
              </span>
            </div>

            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
              {/* Team A */}
              <Link
                href={`/teams/${teamA?.id}`}
                className="group text-center md:text-right"
              >
                <div className="text-2xl font-black text-white transition-colors group-hover:text-sky-300 sm:text-3xl">
                  {teamA?.name ?? "Team A"}
                </div>

                <div className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                  Team A
                </div>
              </Link>

              {/* Score */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 text-5xl font-black tracking-tight text-white sm:text-7xl">
                  <span>{scoreA}</span>
                  <span className="text-xl text-slate-700 sm:text-2xl">
                    :
                  </span>
                  <span>{scoreB}</span>
                </div>

                <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Final Score
                </div>
              </div>

              {/* Team B */}
              <Link
                href={`/teams/${teamB?.id}`}
                className="group text-center md:text-left"
              >
                <div className="text-2xl font-black text-white transition-colors group-hover:text-sky-300 sm:text-3xl">
                  {teamB?.name ?? "Team B"}
                </div>

                <div className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                  Team B
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <SummaryCard
            icon={<Trophy className="h-4 w-4" />}
            label="Total Goals"
            value={scoreA + scoreB}
          />

          <SummaryCard
            icon={<Target className="h-4 w-4" />}
            label="Team A Goals"
            value={scoreA}
          />

          <SummaryCard
            icon={<Target className="h-4 w-4" />}
            label="Team B Goals"
            value={scoreB}
          />

          <SummaryCard
            icon={<Gamepad2 className="h-4 w-4" />}
            label="Players Recorded"
            value={stats.length}
          />
        </section>

        {/* Player stats */}
        {match.status === "completed" && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-black text-white">
                Player Statistics
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <StatsTable
                title={teamA?.name ?? "Team A"}
                stats={teamAPlayerStats}
              />

              <StatsTable
                title={teamB?.name ?? "Team B"}
                stats={teamBPlayerStats}
              />
            </div>
          </section>
        )}

        {/* Match info */}
        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Shield className="h-5 w-5 text-sky-400" />
            <h2 className="font-black text-white">
              Match Information
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Info label="Status" value={match.status} />
            <Info label="Team A" value={teamA?.name ?? "Unknown"} />
            <Info label="Team B" value={teamB?.name ?? "Unknown"} />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatsTable({
  title,
  stats,
}: {
  title: string;
  stats: any[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <div className="border-b border-white/[0.07] px-5 py-4">
        <h3 className="font-black text-white">{title}</h3>
      </div>

      {stats.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-600">
          No player statistics recorded.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {stats.map((stat) => {
            const player = Array.isArray(stat.players)
              ? stat.players[0]
              : stat.players;

            if (!player) return null;

            return (
              <Link
                key={stat.id}
                href={`/players/${player.id}`}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#0b101a]">
                  {player.photo_url ? (
                    <img
                      src={player.photo_url}
                      alt={player.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Gamepad2 className="h-4 w-4 text-slate-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white">
                    {player.full_name}
                  </div>

                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
                    {player.rocket_league_rank || "Unranked"}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <MiniStat label="G" value={stat.goals} />
                  <MiniStat label="A" value={stat.assists} />
                  <MiniStat label="S" value={stat.saves} />
                  <MiniStat label="Sh" value={stat.shots} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="text-[9px] font-black text-slate-700">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-300">
        {value ?? 0}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
        {icon}
        {label}
      </div>

      <div className="mt-2 text-3xl font-black text-white">
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 text-sm font-bold capitalize text-slate-300">
        {value}
      </div>
    </div>
  );
}