"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Search,
  Users,
  ArrowUpRight,
  Trophy,
  UserRound,
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
  team: {
    id: string;
    name: string;
  } | null;
};

type Props = {
  players: Player[];
};

const ranks = [
  "All Ranks",
  "Unranked",
  "Bronze I",
  "Bronze II",
  "Bronze III",
  "Silver I",
  "Silver II",
  "Silver III",
  "Gold I",
  "Gold II",
  "Gold III",
  "Platinum I",
  "Platinum II",
  "Platinum III",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Champion I",
  "Champion II",
  "Champion III",
  "Grand Champion I",
  "Grand Champion II",
  "Grand Champion III",
  "Supersonic Legend",
];

function getRankStyle(rank: string | null) {
  if (!rank || rank === "Unranked") {
    return "border-white/15 bg-white/[0.07] text-slate-300";
  }

  if (rank.startsWith("Bronze")) {
    return "border-orange-400/30 bg-orange-400/[0.10] text-orange-200";
  }

  if (rank.startsWith("Silver")) {
    return "border-slate-300/30 bg-slate-300/[0.10] text-slate-100";
  }

  if (rank.startsWith("Gold")) {
    return "border-yellow-400/30 bg-yellow-400/[0.10] text-yellow-200";
  }

  if (rank.startsWith("Platinum")) {
    return "border-cyan-400/30 bg-cyan-400/[0.10] text-cyan-200";
  }

  if (rank.startsWith("Diamond")) {
    return "border-blue-400/30 bg-blue-400/[0.10] text-blue-200";
  }

  if (rank.startsWith("Champion")) {
    return "border-purple-400/30 bg-purple-400/[0.10] text-purple-200";
  }

  if (rank.startsWith("Grand Champion")) {
    return "border-pink-400/30 bg-pink-400/[0.10] text-pink-200";
  }

  if (rank === "Supersonic Legend") {
    return "border-sky-300/40 bg-sky-300/[0.12] text-sky-100";
  }

  return "border-white/15 bg-white/[0.07] text-slate-300";
}

function getFlagUrl(nationality: string | null) {
  if (!nationality) return null;

  const code = nationality.trim().toLowerCase();

  if (!/^[a-z]{2}$/.test(code)) return null;

  return `https://flagcdn.com/w40/${code}.png`;
}

function getNationalityLabel(nationality: string | null) {
  if (!nationality) return "Not specified";

  return nationality.trim().toUpperCase();
}

export default function PlayersClient({ players }: Props) {
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("All Ranks");

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        !query ||
        player.fullName.toLowerCase().includes(query) ||
        player.team?.name.toLowerCase().includes(query) ||
        player.nationality?.toLowerCase().includes(query);

      const matchesRank =
        rankFilter === "All Ranks" || player.rank === rankFilter;

      return matchesSearch && matchesRank;
    });
  }, [players, search, rankFilter]);

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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-4 py-2">
            <Users className="h-3.5 w-3.5 text-sky-300" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
              Tournament Roster
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
            Players
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Meet the players competing in the NWIS Rocket League tournament.
            Browse their teams, grades, nationalities, and competitive ranks.
          </p>
        </motion.div>

        {/* CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search players, teams, or nationality..."
              className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#0c1422] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-400/40 focus:bg-[#0e1727]"
            />
          </div>

          <select
            value={rankFilter}
            onChange={(event) => setRankFilter(event.target.value)}
            className="h-12 rounded-xl border border-white/[0.12] bg-[#0c1422] px-4 text-sm font-medium text-slate-200 outline-none transition-colors focus:border-sky-400/40"
          >
            {ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </motion.div>

        {/* RESULT COUNT */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            {filteredPlayers.length}{" "}
            {filteredPlayers.length === 1 ? "Player" : "Players"}
          </p>

          {search || rankFilter !== "All Ranks" ? (
            <button
              onClick={() => {
                setSearch("");
                setRankFilter("All Ranks");
              }}
              className="text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {/* PLAYER GRID */}
        {filteredPlayers.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlayers.map((player, index) => {
              const flagUrl = getFlagUrl(player.nationality);

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.045, 0.4),
                  }}
                  whileHover={{ y: -5 }}
                >
                  <Link
                    href={`/players/${player.id}`}
                    className="group block overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0b1320] shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-sky-400/30 hover:bg-[#0d1726] hover:shadow-[0_18px_55px_rgba(0,0,0,0.28)]"
                  >
                    {/* PHOTO */}
                    <div className="relative aspect-[1.05] overflow-hidden bg-[#080e18]">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={player.fullName}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0d1828] to-[#080e18]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06]">
                            <UserRound className="h-8 w-8 text-slate-400" />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070c14] via-[#070c14]/70 to-transparent" />

                      {/* RANK */}
                      <div className="absolute left-4 top-4">
                        <span
                          className={`inline-flex rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${getRankStyle(
                            player.rank
                          )}`}
                        >
                          {player.rank || "Unranked"}
                        </span>
                      </div>

                      {/* PLAYER INFO */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-black tracking-tight text-white">
                            {player.fullName}
                          </h2>

                          <p className="mt-1 truncate text-xs font-medium text-slate-300">
                            {player.team?.name || "No team assigned"}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/40 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                          <ArrowUpRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 divide-x divide-white/[0.08] border-t border-white/[0.08]">
                      {/* GRADE */}
                      <div className="p-4">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          Grade
                        </p>

                        <p className="mt-1.5 text-sm font-bold text-slate-100">
                          {player.grade
                            ? `${player.grade}-${player.section}`
                            : `—-${player.section}`}
                        </p>
                      </div>

                      {/* NATIONALITY */}
                      <div className="min-w-0 p-4">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          Nationality
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          {flagUrl ? (
                            <img
                              src={flagUrl}
                              alt=""
                              width={24}
                              height={18}
                              className="h-[18px] w-6 rounded-[3px] object-cover shadow-sm"
                            />
                          ) : null}

                          <span className="truncate text-sm font-bold text-slate-100">
                            {getNationalityLabel(player.nationality)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-3xl border border-white/[0.10] bg-[#0b1320] px-6 py-20 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.06]">
              <Trophy className="h-6 w-6 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-white">
              No players found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {players.length === 0
                ? "Players will appear here once they are added through the tournament admin panel."
                : "Try adjusting your search or rank filter."}
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}