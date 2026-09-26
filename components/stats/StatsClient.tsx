"use client";

import { motion } from "motion/react";
import {
  Activity,
  Award,
  Crosshair,
  Search,
  Shield,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type Team = {
  id: string;
  name: string;
};

type PlayerStat = {
  id: string;
  name: string;
  photoUrl: string | null;
  rank: string | null;
  team: Team | null;
  matches: number;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
};

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
  position: number;
};

type Overview = {
  matches: number;
  goals: number;
  assists: number;
  saves: number;
};

type Props = {
  playerStats: PlayerStat[];
  standings: Standing[];
  overview: Overview;
};

type Category = "goals" | "assists" | "saves" | "shots";

const categories: {
  label: string;
  value: Category;
  icon: typeof Target;
}[] = [
  {
    label: "Goals",
    value: "goals",
    icon: Target,
  },
  {
    label: "Assists",
    value: "assists",
    icon: Zap,
  },
  {
    label: "Saves",
    value: "saves",
    icon: Shield,
  },
  {
    label: "Shots",
    value: "shots",
    icon: Crosshair,
  },
];

function getRankClass(rank: string | null) {
  if (!rank) {
    return "border-white/10 bg-white/[0.04] text-slate-400";
  }

  if (rank.startsWith("Grand Champion")) {
    return "border-purple-400/20 bg-purple-400/[0.07] text-purple-300";
  }

  if (rank.startsWith("Champion")) {
    return "border-red-400/20 bg-red-400/[0.07] text-red-300";
  }

  if (rank.startsWith("Diamond")) {
    return "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300";
  }

  if (rank.startsWith("Platinum")) {
    return "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300";
  }

  if (rank.startsWith("Gold")) {
    return "border-yellow-400/20 bg-yellow-400/[0.07] text-yellow-300";
  }

  if (rank.startsWith("Silver")) {
    return "border-slate-300/20 bg-slate-300/[0.06] text-slate-300";
  }

  if (rank.startsWith("Bronze")) {
    return "border-orange-400/20 bg-orange-400/[0.07] text-orange-300";
  }

  return "border-white/10 bg-white/[0.04] text-slate-400";
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function StatsClient({
  playerStats,
  standings,
  overview,
}: Props) {
  const [category, setCategory] =
    useState<Category>("goals");

  const [search, setSearch] = useState("");

  const sortedPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...playerStats]
      .filter((player) => {
        if (!query) return true;

        return (
          player.name.toLowerCase().includes(query) ||
          player.team?.name.toLowerCase().includes(query) ||
          player.rank?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const difference =
          b[category] - a[category];

        if (difference !== 0) {
          return difference;
        }

        return b.matches - a.matches;
      });
  }, [playerStats, search, category]);

  const categoryLabel =
    categories.find((item) => item.value === category)?.label ??
    "Goals";

  return (
    <main className="min-h-screen px-6 pb-24 pt-36 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1250px]">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2">
            <Activity className="h-3.5 w-3.5 text-sky-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
              Tournament Statistics
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
            Stats
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Follow the league standings, playoff race, and individual
            player performances throughout the tournament.
          </p>
        </motion.div>

        {/* OVERVIEW */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Matches Played",
              value: overview.matches,
              icon: Trophy,
            },
            {
              label: "Total Goals",
              value: overview.goals,
              icon: Target,
            },
            {
              label: "Total Assists",
              value: overview.assists,
              icon: Zap,
            },
            {
              label: "Total Saves",
              value: overview.saves,
              icon: Shield,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                    <Icon className="h-4 w-4 text-sky-400" />
                  </div>

                  <span className="text-2xl font-black text-white">
                    {item.value}
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* LEAGUE STANDINGS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-sky-400" />

                <p className="text-sm font-bold text-white">
                  League Standings
                </p>
              </div>

              <p className="mt-1 text-[11px] text-slate-600">
                1 point for a win · Top 4 qualify for the semifinals
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Playoff position
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
            {standings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-left">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        Pos
                      </th>

                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        Team
                      </th>

                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        P
                      </th>

                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        W
                      </th>

                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        L
                      </th>

                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        GF
                      </th>

                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        GA
                      </th>

                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        GD
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        PTS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {standings.map((team, index) => {
                      const playoff =
                        team.position <= 4;

                      const gdLabel =
                        team.gd > 0
                          ? `+${team.gd}`
                          : team.gd.toString();

                      return (
                        <motion.tr
                          key={team.id}
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.3,
                            delay: Math.min(
                              index * 0.04,
                              0.3
                            ),
                          }}
                          className={`border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02] ${
                            playoff
                              ? "bg-sky-400/[0.015]"
                              : ""
                          }`}
                        >
                          {/* POSITION */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black ${
                                  playoff
                                    ? "border border-sky-400/15 bg-sky-400/[0.07] text-sky-300"
                                    : "border border-white/[0.06] bg-white/[0.025] text-slate-500"
                                }`}
                              >
                                {team.position}
                              </span>

                              {playoff && (
                                <span
                                  className="hidden text-[9px] font-bold uppercase tracking-[0.12em] text-sky-500/70 lg:block"
                                >
                                  SF
                                </span>
                              )}
                            </div>
                          </td>

                          {/* TEAM */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                                {playoff ? (
                                  <Award className="h-4 w-4 text-sky-400" />
                                ) : (
                                  <Trophy className="h-3.5 w-3.5 text-slate-600" />
                                )}
                              </div>

                              <div>
                                <p
                                  className={`text-sm font-bold ${
                                    playoff
                                      ? "text-white"
                                      : "text-slate-300"
                                  }`}
                                >
                                  {team.name}
                                </p>

                                {playoff && (
                                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-sky-500/60">
                                    Playoff position
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* PLAYED */}
                          <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">
                            {team.played}
                          </td>

                          {/* WINS */}
                          <td className="px-4 py-4 text-center text-xs font-bold text-emerald-300">
                            {team.wins}
                          </td>

                          {/* LOSSES */}
                          <td className="px-4 py-4 text-center text-xs font-bold text-slate-500">
                            {team.losses}
                          </td>

                          {/* GF */}
                          <td className="px-4 py-4 text-center text-xs font-bold text-slate-300">
                            {team.gf}
                          </td>

                          {/* GA */}
                          <td className="px-4 py-4 text-center text-xs font-bold text-slate-500">
                            {team.ga}
                          </td>

                          {/* GD */}
                          <td
                            className={`px-4 py-4 text-center text-xs font-black ${
                              team.gd > 0
                                ? "text-emerald-300"
                                : team.gd < 0
                                ? "text-red-300"
                                : "text-slate-400"
                            }`}
                          >
                            {gdLabel}
                          </td>

                          {/* POINTS */}
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-white">
                              {team.points}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                  <Trophy className="h-6 w-6 text-slate-600" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-white">
                  League standings coming soon
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Standings will appear here once the tournament
                  has completed its first match.
                </p>
              </div>
            )}
          </div>

          {/* TIEBREAKER INFO */}
          {standings.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                Tiebreak order
              </p>

              <p className="text-[10px] font-bold text-slate-500">
                Points → Goal Difference → Goals For
              </p>
            </div>
          )}
        </motion.section>

        {/* PLAYER CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14"
        >
          <div className="mb-4">
            <p className="text-sm font-bold text-white">
              Player Statistics
            </p>

            <p className="mt-1 text-[11px] text-slate-600">
              Individual performance across completed matches
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search players, teams or ranks..."
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
              />
            </div>

            <div className="flex overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
              {categories.map((item) => {
                const Icon = item.icon;
                const active =
                  category === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() =>
                      setCategory(item.value)
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                      active
                        ? "bg-white/[0.09] text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* PLAYER TABLE */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-bold text-white">
                Player Leaderboard
              </p>

              <p className="mt-1 text-[11px] text-slate-600">
                Ranked by {categoryLabel.toLowerCase()}
              </p>
            </div>

            <p className="text-xs font-semibold text-slate-600">
              {sortedPlayers.length} players
            </p>
          </div>

          {sortedPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/[0.05] text-left">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      #
                    </th>

                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Player
                    </th>

                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Team
                    </th>

                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Matches
                    </th>

                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Goals
                    </th>

                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Assists
                    </th>

                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Saves
                    </th>

                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Shots
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Shooting %
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedPlayers.map((player, index) => {
                    const shootingPercentage =
                      player.shots > 0
                        ? (player.goals /
                            player.shots) *
                          100
                        : 0;

                    return (
                      <motion.tr
                        key={player.id}
                        initial={{
                          opacity: 0,
                          x: -10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(
                            index * 0.025,
                            0.3
                          ),
                        }}
                        className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {player.photoUrl ? (
                              <img
                                src={player.photoUrl}
                                alt=""
                                className="h-9 w-9 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-[10px] font-black text-sky-400">
                                {initials(player.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">
                                {player.name}
                              </p>

                              {player.rank && (
                                <span
                                  className={`mt-1 inline-flex rounded-md border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${getRankClass(
                                    player.rank
                                  )}`}
                                >
                                  {player.rank}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-slate-400">
                            {player.team?.name ??
                              "Unassigned"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">
                          {player.matches}
                        </td>

                        <td
                          className={`px-4 py-4 text-center text-sm font-black ${
                            category === "goals"
                              ? "text-sky-300"
                              : "text-white"
                          }`}
                        >
                          {player.goals}
                        </td>

                        <td
                          className={`px-4 py-4 text-center text-sm font-black ${
                            category === "assists"
                              ? "text-sky-300"
                              : "text-white"
                          }`}
                        >
                          {player.assists}
                        </td>

                        <td
                          className={`px-4 py-4 text-center text-sm font-black ${
                            category === "saves"
                              ? "text-sky-300"
                              : "text-white"
                          }`}
                        >
                          {player.saves}
                        </td>

                        <td
                          className={`px-4 py-4 text-center text-sm font-black ${
                            category === "shots"
                              ? "text-sky-300"
                              : "text-white"
                          }`}
                        >
                          {player.shots}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-white">
                            {shootingPercentage.toFixed(
                              1
                            )}
                            %
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                <Activity className="h-6 w-6 text-slate-600" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-white">
                No statistics yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Player statistics will appear here after
                completed matches have recorded player
                performance data.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
