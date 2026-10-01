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

type MatchStage =
  | "league"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";

type Match = {
  id: string;
  teamA: Team | null;
  teamB: Team | null;
  scheduledAt: string | null;
  status: "upcoming" | "completed";
  stage: MatchStage;
  scoreA: number;
  scoreB: number;
};

type Props = {
  matches: Match[];
};

type Filter = "all" | "upcoming" | "completed";

function stageLabel(stage: MatchStage) {
  switch (stage) {
    case "round_of_16":
      return "Round of 16";
    case "quarterfinal":
      return "Quarterfinal";
    case "semifinal":
      return "Semifinal";
    case "final":
      return "Final";
    default:
      return "League Phase";
  }
}

function shortStageLabel(stage: MatchStage) {
  switch (stage) {
    case "round_of_16":
      return "R16";
    case "quarterfinal":
      return "QF";
    case "semifinal":
      return "SF";
    case "final":
      return "FINAL";
    default:
      return "LEAGUE";
  }
}

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

  const knockoutMatches = useMemo(() => {
    const sortMatches = (stage: MatchStage) =>
      matches
        .filter((match) => match.stage === stage)
        .sort(
          (a, b) =>
            new Date(a.scheduledAt ?? 0).getTime() -
            new Date(b.scheduledAt ?? 0).getTime()
        );

    return {
      roundOf16: sortMatches("round_of_16"),
      quarterfinal: sortMatches("quarterfinal"),
      semifinal: sortMatches("semifinal"),
      final: sortMatches("final"),
    };
  }, [matches]);

  const hasKnockout =
    knockoutMatches.roundOf16.length > 0 ||
    knockoutMatches.quarterfinal.length > 0 ||
    knockoutMatches.semifinal.length > 0 ||
    knockoutMatches.final.length > 0;

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

  function isWinner(match: Match, side: "a" | "b") {
    if (match.status !== "completed") return false;

    return side === "a"
      ? match.scoreA > match.scoreB
      : match.scoreB > match.scoreA;
  }

  function getWinner(match: Match) {
    if (match.status !== "completed") return null;

    if (match.scoreA > match.scoreB) return match.teamA;
    if (match.scoreB > match.scoreA) return match.teamB;

    return null;
  }

  function BracketMatch({
    match,
    index,
  }: {
    match: Match | null;
    index: number;
  }) {
    if (!match) {
      return (
        <div className="flex h-[126px] w-[190px] items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01]">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-700">
            Match TBD
          </span>
        </div>
      );
    }

    const winner = getWinner(match);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.04, 0.3),
        }}
        className="relative"
      >
        <Link
          href={`/matches/${match.id}`}
          className="group block w-[190px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1220] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/25 hover:bg-[#0e1728]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
              {shortStageLabel(match.stage)} {index + 1}
            </span>

            {match.status === "completed" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Clock3 className="h-3.5 w-3.5 text-sky-400" />
            )}
          </div>

          <div className="divide-y divide-white/[0.05]">
            <div
              className={`flex items-center justify-between gap-3 px-3 py-2.5 ${
                isWinner(match, "a")
                  ? "bg-sky-400/[0.07]"
                  : ""
              }`}
            >
              <span
                className={`truncate text-xs font-bold ${
                  isWinner(match, "a")
                    ? "text-white"
                    : match.teamA
                      ? "text-slate-300"
                      : "text-slate-700"
                }`}
              >
                {match.teamA?.name || "TBD"}
              </span>

              <span
                className={`text-sm font-black ${
                  isWinner(match, "a")
                    ? "text-sky-300"
                    : "text-slate-500"
                }`}
              >
                {match.status === "completed" ? match.scoreA : "—"}
              </span>
            </div>

            <div
              className={`flex items-center justify-between gap-3 px-3 py-2.5 ${
                isWinner(match, "b")
                  ? "bg-sky-400/[0.07]"
                  : ""
              }`}
            >
              <span
                className={`truncate text-xs font-bold ${
                  isWinner(match, "b")
                    ? "text-white"
                    : match.teamB
                      ? "text-slate-300"
                      : "text-slate-700"
                }`}
              >
                {match.teamB?.name || "TBD"}
              </span>

              <span
                className={`text-sm font-black ${
                  isWinner(match, "b")
                    ? "text-sky-300"
                    : "text-slate-500"
                }`}
              >
                {match.status === "completed" ? match.scoreB : "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.05] px-3 py-2">
            <span className="truncate text-[8px] font-semibold text-slate-600">
              {match.scheduledAt
                ? formatDate(match.scheduledAt)
                : "Schedule TBD"}
            </span>

            <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-700 transition-all group-hover:text-sky-400" />
          </div>

          {winner && (
            <div className="border-t border-sky-400/10 bg-sky-400/[0.035] px-3 py-1.5">
              <p className="truncate text-[8px] font-black uppercase tracking-[0.13em] text-sky-400">
                {winner.name} advances
              </p>
            </div>
          )}
        </Link>
      </motion.div>
    );
  }

  function BracketRound({
    title,
    subtitle,
    matches: roundMatches,
    totalSlots,
    spacing,
  }: {
    title: string;
    subtitle: string;
    matches: Match[];
    totalSlots: number;
    spacing: number;
  }) {
    const items = Array.from(
      { length: totalSlots },
      (_, index) => roundMatches[index] ?? null
    );

    return (
      <div className="relative flex w-[190px] shrink-0 flex-col">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.17em] text-white">
            {title}
          </p>

          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
            {subtitle}
          </p>
        </div>

        <div
          className="flex flex-col"
          style={{
            gap: `${spacing}px`,
          }}
        >
          {items.map((match, index) => (
            <BracketMatch
              key={match?.id ?? `empty-${title}-${index}`}
              match={match}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 pb-24 pt-36 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
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
            Follow the complete NWIS Rocket League fixture list, from the
            league phase through the knockout rounds and championship final.
          </p>
        </motion.div>

        {/* KNOCKOUT BRACKET */}
        {hasKnockout && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-14"
          >
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-sky-400" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">
                  Knockout Stage
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Championship Bracket
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Top 16 advance from the league phase.
              </p>
            </div>

            <div className="relative mt-7 overflow-x-auto rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
              <div className="relative flex min-w-[1030px] items-start gap-[54px]">
                {/* R16 */}
                <BracketRound
                  title="Round of 16"
                  subtitle="8 matches"
                  matches={knockoutMatches.roundOf16}
                  totalSlots={8}
                  spacing={18}
                />

                {/* QF */}
                <div className="relative pt-[118px]">
                  <BracketRound
                    title="Quarterfinals"
                    subtitle="4 matches"
                    matches={knockoutMatches.quarterfinal}
                    totalSlots={4}
                    spacing={126}
                  />
                </div>

                {/* SF */}
                <div className="relative pt-[244px]">
                  <BracketRound
                    title="Semifinals"
                    subtitle="2 matches"
                    matches={knockoutMatches.semifinal}
                    totalSlots={2}
                    spacing={342}
                  />
                </div>

                {/* FINAL */}
                <div className="relative pt-[370px]">
                  <BracketRound
                    title="Final"
                    subtitle="Championship"
                    matches={knockoutMatches.final}
                    totalSlots={1}
                    spacing={0}
                  />
                </div>
              </div>

              {/* CONNECTOR LINES */}
              <div className="pointer-events-none absolute inset-0 hidden lg:block">
                {/* R16 → QF */}
                <div className="absolute left-[245px] top-[125px] h-[456px] w-[54px]">
                  <div className="absolute left-0 top-0 h-full border-r border-sky-400/15" />

                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="absolute left-0 h-px w-[54px] bg-sky-400/15"
                      style={{
                        top: `${i * 144 + 62}px`,
                      }}
                    />
                  ))}
                </div>

                {/* QF → SF */}
                <div className="absolute left-[489px] top-[243px] h-[216px] w-[54px]">
                  <div className="absolute left-0 top-0 h-full border-r border-sky-400/15" />

                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="absolute left-0 h-px w-[54px] bg-sky-400/15"
                      style={{
                        top: `${i * 216 + 62}px`,
                      }}
                    />
                  ))}
                </div>

                {/* SF → Final */}
                <div className="absolute left-[733px] top-[361px] h-[1px] w-[54px] bg-sky-400/15" />
              </div>
            </div>
          </motion.section>
        )}

        {/* CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 flex flex-col gap-3 lg:flex-row"
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
                  onClick={() =>
                    setFilter(item.value as Filter)
                  }
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
            {filteredMatches.length === 1
              ? "Match"
              : "Matches"}
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                          {stageLabel(match.stage)}
                        </span>

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
                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-sky-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
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