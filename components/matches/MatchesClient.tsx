"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Swords,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  teamA: Team | null;
  teamB: Team | null;
  scheduledAt: string | null;
  status: "upcoming" | "completed";
  scoreA: number;
  scoreB: number;
};

type Props = {
  matches: Match[];
};

type Filter = "all" | "upcoming" | "completed";

export default function MatchesClient({ matches }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return matches.filter((match) => {
      const matchesSearch =
        !query ||
        match.teamA?.name.toLowerCase().includes(query) ||
        match.teamB?.name.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || match.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [matches, search, filter]);

  function formatDate(date: string | null) {
    if (!date) return "Date TBD";

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatTime(date: string | null) {
    if (!date) return "Time TBD";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function isWinner(
    match: Match,
    side: "a" | "b"
  ) {
    if (match.status !== "completed") return false;

    if (side === "a") {
      return match.scoreA > match.scoreB;
    }

    return match.scoreB > match.scoreA;
  }

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
            <Swords className="h-3.5 w-3.5 text-sky-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
              Tournament Schedule
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
            Matches
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Follow the complete NWIS Rocket League fixture list, from upcoming
            matchups to completed results.
          </p>
        </motion.div>

        {/* CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams..."
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
            />
          </div>

          <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
            {[
              { label: "All", value: "all" },
              { label: "Upcoming", value: "upcoming" },
              { label: "Completed", value: "completed" },
            ].map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value as Filter)}
                  className={`rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                    active
                      ? "bg-white/[0.09] text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* COUNT */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
            {filteredMatches.length}{" "}
            {filteredMatches.length === 1 ? "Match" : "Matches"}
          </p>

          {(search || filter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* MATCH LIST */}
        {filteredMatches.length > 0 ? (
          <div className="mt-5 space-y-3">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.055, 0.4),
                }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/matches/${match.id}`}
                  className="group block overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-sky-400/15 hover:bg-white/[0.04]"
                >
                  <div className="grid items-center gap-6 p-5 sm:p-6 lg:grid-cols-[180px_1fr_160px]">
                    {/* DATE */}
                    <div className="flex items-center gap-3 lg:border-r lg:border-white/[0.06] lg:pr-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                        <CalendarDays className="h-4 w-4 text-sky-400" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          {formatDate(match.scheduledAt)}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-600">
                          {formatTime(match.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    {/* TEAMS */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8">
                      <div
                        className={`min-w-0 flex-1 text-right transition-colors ${
                          isWinner(match, "a")
                            ? "text-white"
                            : "text-slate-300"
                        }`}
                      >
                        <p className="truncate text-base font-black sm:text-lg">
                          {match.teamA?.name || "TBD"}
                        </p>

                        {isWinner(match, "a") && (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sky-400">
                            Winner
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-center">
                        {match.status === "completed" ? (
                          <div className="flex items-center gap-2 text-2xl font-black text-white">
                            <span>{match.scoreA}</span>

                            <span className="text-sm text-slate-700">
                              —
                            </span>

                            <span>{match.scoreB}</span>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                            VS
                          </div>
                        )}
                      </div>

                      <div
                        className={`min-w-0 flex-1 text-left transition-colors ${
                          isWinner(match, "b")
                            ? "text-white"
                            : "text-slate-300"
                        }`}
                      >
                        <p className="truncate text-base font-black sm:text-lg">
                          {match.teamB?.name || "TBD"}
                        </p>

                        {isWinner(match, "b") && (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sky-400">
                            Winner
                          </p>
                        )}
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                      {match.status === "completed" ? (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-sky-400/10 bg-sky-400/[0.05] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                          <Clock3 className="h-3.5 w-3.5" />
                          Upcoming
                        </span>
                      )}

                      <ArrowUpRight className="h-4 w-4 text-slate-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-sky-400" />
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
              No matches found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {matches.length === 0
                ? "Matches will appear here once they are scheduled through the tournament admin panel."
                : "Try adjusting your search or match filter."}
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}