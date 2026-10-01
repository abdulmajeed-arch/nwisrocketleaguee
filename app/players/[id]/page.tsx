import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Crosshair,
  Flag,
  Gamepad2,
  Shield,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  formatNationality,
  getCountryFlag,
} from "@/lib/nationality";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PlayerStats = {
  matches: number;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
};

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // ---------------------------------------------------------
  // PLAYER
  // ---------------------------------------------------------

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      photo_url,
      grade,
      section,
      nationality,
      rocket_league_rank
    `)
    .eq("id", id)
    .single();

  if (playerError || !player) {
    notFound();
  }

  // ---------------------------------------------------------
  // TEAM
  // ---------------------------------------------------------

  const { data: teamPlayer } = await supabase
    .from("team_players")
    .select(`
      team_id,
      teams (
        id,
        name
      )
    `)
    .eq("player_id", id)
    .maybeSingle();

  // ---------------------------------------------------------
  // PLAYER STATS
  // ---------------------------------------------------------

  const { data: stats } = await supabase
    .from("match_player_stats")
    .select(`
      goals,
      assists,
      saves,
      shots
    `)
    .eq("player_id", id);

  const totalStats: PlayerStats = (stats ?? []).reduce<PlayerStats>(
    (acc, stat) => {
      acc.matches += 1;
      acc.goals += stat.goals ?? 0;
      acc.assists += stat.assists ?? 0;
      acc.saves += stat.saves ?? 0;
      acc.shots += stat.shots ?? 0;

      return acc;
    },
    {
      matches: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      shots: 0,
    }
  );

  // ---------------------------------------------------------
  // TEAM NORMALIZATION
  // ---------------------------------------------------------

  const team = Array.isArray(teamPlayer?.teams)
    ? teamPlayer.teams[0]
    : teamPlayer?.teams;

  // ---------------------------------------------------------
  // NATIONALITY
  // ---------------------------------------------------------

  const nationalityName = player.nationality
    ? formatNationality(player.nationality).split(" — ")[1]
    : "Nationality not provided";

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6">
      <div className="mx-auto max-w-[1180px]">

        {/* Back */}
        <Link
          href="/players"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Players
        </Link>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/[0.08] via-transparent to-transparent" />

          <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[180px_1fr] md:items-center">

            {/* Player photo */}
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0b101a] md:mx-0">
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt={player.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Gamepad2 className="h-14 w-14 text-slate-700" />
                </div>
              )}
            </div>

            {/* Player heading */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">

                {/* Rank */}
                <span className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-black text-sky-300">
                  {player.rocket_league_rank || "Unranked"}
                </span>

                {/* Nationality */}
                {player.nationality && (
                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-400">
                    {formatNationality(player.nationality)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                {player.full_name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">

                {/* Grade */}
                <span>
                  Grade {player.grade}
                  {player.section ? `-${player.section}` : ""}
                </span>

                {/* Team */}
                {team && (
                  <>
                    <span className="text-slate-700">•</span>

                    <Link
                      href={`/teams/${team.id}`}
                      className="font-bold text-sky-400 transition-colors hover:text-sky-300"
                    >
                      {team.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-400" />

            <h2 className="text-lg font-black text-white">
              Tournament Stats
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <StatCard
              icon={<Gamepad2 className="h-4 w-4" />}
              label="Matches"
              value={totalStats.matches}
            />

            <StatCard
              icon={<Target className="h-4 w-4" />}
              label="Goals"
              value={totalStats.goals}
            />

            <StatCard
              icon={<Crosshair className="h-4 w-4" />}
              label="Assists"
              value={totalStats.assists}
            />

            <StatCard
              icon={<Shield className="h-4 w-4" />}
              label="Saves"
              value={totalStats.saves}
            />

            <StatCard
              icon={<Trophy className="h-4 w-4" />}
              label="Shots"
              value={totalStats.shots}
            />

          </div>
        </section>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <section className="mt-8 grid gap-6 md:grid-cols-2">

          {/* Player information */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">

            <div className="mb-5 flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-400" />

              <h2 className="font-black text-white">
                Player Information
              </h2>
            </div>

            <div className="space-y-4">

              <InfoRow
                label="Name"
                value={player.full_name}
              />

              <InfoRow
                label="Grade"
                value={
                  player.section
                    ? `${player.grade}-${player.section}`
                    : `Grade ${player.grade}`
                }
              />

              <InfoRow
                label="Rank"
                value={player.rocket_league_rank || "Unranked"}
              />

              <InfoRow
                label="Nationality"
                value={
                  player.nationality
                    ? formatNationality(player.nationality)
                    : "Unknown"
                }
              />

              <InfoRow
                label="Team"
                value={team?.name ?? "Free Agent"}
              />

            </div>
          </div>

          {/* Nationality */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">

            <div className="mb-5 flex items-center gap-2">
              <Flag className="h-5 w-5 text-sky-400" />

              <h2 className="font-black text-white">
                Nationality
              </h2>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

              <span className="text-5xl">
                {getCountryFlag(player.nationality)}
              </span>

              <div>
                <div className="text-lg font-black text-white">
                  {player.nationality?.trim().toUpperCase() ?? "N/A"}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {nationalityName}
                </div>
              </div>

            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-sky-400/[0.15] hover:bg-white/[0.035]">

      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
        {icon}
        {label}
      </div>

      <div className="text-3xl font-black text-white">
        {value}
      </div>

    </div>
  );
}

// =============================================================
// INFO ROW
// =============================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="text-right text-sm font-bold text-slate-300">
        {value}
      </span>

    </div>
  );
}