"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Search,
  Trophy,
  Users,
  UserRound,
  Swords,
} from "lucide-react";
import { useMemo, useState } from "react";

type Player = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  grade: number | null;
  section: string;
  nationality: string | null;
  rank: string | null;
};

type Team = {
  id: string;
  name: string;
  players: Player[];
  matches: number;
};

type Props = {
  teams: Team[];
};

function getRankStyle(rank: string | null) {
  if (!rank || rank === "Unranked") {
    return "text-slate-500";
  }

  if (rank.startsWith("Bronze")) return "text-orange-300";
  if (rank.startsWith("Silver")) return "text-slate-200";
  if (rank.startsWith("Gold")) return "text-yellow-300";
  if (rank.startsWith("Platinum")) return "text-cyan-300";
  if (rank.startsWith("Diamond")) return "text-blue-300";
  if (rank.startsWith("Champion")) return "text-purple-300";
  if (rank.startsWith("Grand Champion")) return "text-pink-300";
  if (rank === "Supersonic Legend") return "text-sky-200";

  return "text-slate-400";
}

export default function TeamsClient({ teams }: Props) {
  const [search, setSearch] = useState("");

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return teams;

    return teams.filter((team) => {
      if (team.name.toLowerCase().includes(query)) {
        return true;
      }

      return team.players.some((player) =>
        player.fullName.toLowerCase().includes(query)
      );
    });
  }, [teams, search]);

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
            <Trophy className="h-3.5 w-3.5 text-sky-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
              Tournament Teams
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
            Teams
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Explore every Rocket League duo competing in the NWIS tournament.
            View their rosters and tournament activity.
          </p>
        </motion.div>

        {/* SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10"
        >
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams or players..."
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
            />
          </div>
        </motion.div>

        {/* RESULT COUNT */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
            {filteredTeams.length}{" "}
            {filteredTeams.length === 1 ? "Team" : "Teams"}
          </p>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
            >
              Clear search
            </button>
          )}
        </div>

        {/* TEAM GRID */}
        {filteredTeams.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.07, 0.45),
                }}
                whileHover={{ y: -5 }}
              >
                <Link
                  href={`/teams/${team.id}`}
                  className="group block overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.04] hover:shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
                >
                  {/* TEAM HEADER */}
                  <div className="relative overflow-hidden border-b border-white/[0.06] p-6 sm:p-7">
                    <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-sky-400/[0.045] blur-[70px] transition-all duration-500 group-hover:bg-sky-400/[0.08]" />

                    <div className="relative flex items-start justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/15 bg-sky-400/[0.06]"
                        >
                          <Trophy className="h-6 w-6 text-sky-400" />
                        </motion.div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            Team
                          </p>

                          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                            {team.name}
                          </h2>
                        </div>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 transition-all duration-300 group-hover:border-sky-400/20 group-hover:bg-sky-400/[0.07] group-hover:text-sky-300">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* TEAM META */}
                    <div className="relative mt-6 flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-600" />

                        <span className="text-xs font-medium text-slate-500">
                          {team.players.length}/2 players
                        </span>
                      </div>

                      <div className="h-3 w-px bg-white/[0.08]" />

                      <div className="flex items-center gap-2">
                        <Swords className="h-3.5 w-3.5 text-slate-600" />

                        <span className="text-xs font-medium text-slate-500">
                          {team.matches}{" "}
                          {team.matches === 1 ? "match" : "matches"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ROSTER */}
                  <div className="p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Roster
                      </p>

                      <p className="text-[10px] font-semibold text-slate-700">
                        2 PLAYER TEAM
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[0, 1].map((slot) => {
                        const player = team.players[slot];

                        if (!player) {
                          return (
                            <div
                              key={`empty-${slot}`}
                              className="flex min-h-[86px] items-center gap-3 rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] px-4"
                            >
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
                                <UserRound className="h-4 w-4 text-slate-700" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-600">
                                  Open Slot
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-700">
                                  Player {slot + 1}
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={player.id}
                            className="flex min-h-[86px] items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 transition-colors duration-300 group-hover:border-white/[0.09]"
                          >
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0f18]">
                              {player.photoUrl ? (
                                <img
                                  src={player.photoUrl}
                                  alt={player.fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRound className="h-4 w-4 text-slate-600" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">
                                {player.fullName}
                              </p>

                              <p
                                className={`mt-1 truncate text-[10px] font-semibold ${getRankStyle(
                                  player.rank
                                )}`}
                              >
                                {player.rank || "Unranked"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-20 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
              <Trophy className="h-6 w-6 text-slate-600" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-white">
              No teams found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {teams.length === 0
                ? "Teams will appear here once they are created through the tournament admin panel."
                : "Try adjusting your search."}
            </p>
          </motion.div>
        )}

        {/* RULE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex items-center justify-center gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-700"
        >
          <span className="h-px w-8 bg-white/[0.06]" />
          Every team consists of exactly two players
          <span className="h-px w-8 bg-white/[0.06]" />
        </motion.div>
      </div>
    </main>
  );
}