"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Play,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

type Player = {
  id: string;
};

type Team = {
  id: string;
};

type Match = {
  id: string;
  team_a_id: string;
  team_b_id: string;
  scheduled_at: string | null;
  status: "upcoming" | "completed";
};

type Highlight = {
  id: string;
  match_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
};

type HomeClientProps = {
  players: Player[];
  teams: Team[];
  matches: Match[];
  highlights: Highlight[];
};

export default function HomeClient({
  players,
  teams,
  matches,
  highlights,
}: HomeClientProps) {
  const totalPlayers = players.length;
  const totalTeams = teams.length;
  const totalMatches = matches.length;

  const completedMatches = matches.filter(
    (match) => match.status === "completed"
  ).length;

  const upcomingMatches = matches.filter(
    (match) => match.status === "upcoming"
  );

  const nextMatch = upcomingMatches[0] ?? null;

  function formatDate(date: string | null) {
    if (!date) return "TBD";

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }

  function formatTime(date: string | null) {
    if (!date) return "TBD";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  }

  return (
    <main className="min-h-screen overflow-hidden">
      {/* HERO */}
      <section className="relative px-6 pb-24 pt-28 sm:px-10 sm:pt-30 lg:px-16 lg:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-sky-500/[0.08] blur-[120px]"
          />

          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-40 top-40 h-80 w-80 rounded-full bg-blue-500/[0.05] blur-[100px]"
          />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="mx-auto max-w-[1250px]">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            {/* HERO CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
                </span>

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300">
                  Official Tournament
                </span>
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Rocket League
                <span className="mt-2 block text-gradient">
                  Tournament.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                The official NWIS Rocket League tournament hub. Follow the
                players, teams, matches, statistics, and best moments from the
                competition.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/matches"
                  className="group inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition-all duration-300 hover:bg-sky-300 hover:shadow-[0_0_35px_rgba(56,189,248,0.18)]"
                >
                  View Matches
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/teams"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07]"
                >
                  Explore Teams
                </Link>
              </div>
            </motion.div>

            {/* HERO VISUAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="relative mx-auto hidden w-full max-w-[480px] lg:block"
            >
              <div className="relative aspect-square">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-8 rounded-full border border-sky-400/10"
                />

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-20 rounded-full border border-dashed border-white/[0.08]"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      "0 0 50px rgba(14,165,233,0.08)",
                      "0 0 80px rgba(14,165,233,0.16)",
                      "0 0 50px rgba(14,165,233,0.08)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-sky-400/20 bg-[#08101b]/90"
                >
                  <div className="text-center">
                    <div className="text-5xl font-black tracking-tight text-white">
                      RL
                    </div>

                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
                      Tournament
                    </div>
                  </div>
                </motion.div>

                {/* PLAYER COUNT */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-0 top-20 rounded-2xl border border-white/10 bg-[#0a0f18]/90 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <Users className="h-5 w-5 text-sky-400" />

                  <div className="mt-2 text-xl font-black text-white">
                    {totalPlayers}
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Players
                  </div>
                </motion.div>

                {/* TEAM COUNT */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-0 top-36 rounded-2xl border border-white/10 bg-[#0a0f18]/90 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <Trophy className="h-5 w-5 text-sky-400" />

                  <div className="mt-2 text-xl font-black text-white">
                    {totalTeams}
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Teams
                  </div>
                </motion.div>

                {/* MATCH COUNT */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-16 left-10 rounded-2xl border border-white/10 bg-[#0a0f18]/90 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <Zap className="h-5 w-5 text-sky-400" />

                  <div className="mt-2 text-xl font-black text-white">
                    {completedMatches}
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Played
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1250px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Players",
              value: totalPlayers,
              icon: Users,
            },
            {
              label: "Teams",
              value: totalTeams,
              icon: Trophy,
            },
            {
              label: "Matches",
              value: totalMatches,
              icon: CalendarDays,
            },
            {
              label: "Highlights",
              value: highlights.length,
              icon: Play,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                whileHover={{ y: -3 }}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:border-sky-400/15 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                    <Icon className="h-4 w-4 text-sky-400" />
                  </div>

                  <span className="text-3xl font-black tracking-tight text-white">
                    {stat.value}
                  </span>
                </div>

                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* NEXT MATCH */}
      {nextMatch && (
        <section className="px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
                  Up next
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Next Match
                </h2>
              </div>

              <Link
                href="/matches"
                className="group hidden items-center gap-1 text-sm font-semibold text-slate-400 transition-colors hover:text-white sm:flex"
              >
                All matches
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]"
            >
              <div className="grid items-center gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto_1fr]">
                <div className="text-center lg:text-right">
                  <div className="text-2xl font-black text-white">
                    Match
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Upcoming tournament match
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                    {formatDate(nextMatch.scheduled_at)}
                  </div>

                  <div className="my-3 text-3xl font-black text-white">
                    VS
                  </div>

                  <div className="text-xs font-semibold text-slate-500">
                    {formatTime(nextMatch.scheduled_at)}
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-white">
                    Coming Up
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Check matches for the full fixture
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* HIGHLIGHTS */}
      {highlights.length > 0 && (
        <section className="px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
                  Latest
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Highlights
                </h2>
              </div>

              <Link
                href="/highlights"
                className="group flex items-center gap-1 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
              >
                View all
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-sky-400/15"
                >
                  <Link
                    href={highlight.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="relative aspect-video overflow-hidden bg-[#0a0f18]">
                      {highlight.thumbnail_url ? (
                        <img
                          src={highlight.thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Play className="h-8 w-8 text-sky-400" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />

                      <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md">
                        <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-1 font-bold text-white">
                        {highlight.title}
                      </h3>

                      {highlight.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {highlight.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="px-6 pb-16 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[1250px] overflow-hidden rounded-3xl border border-sky-400/10 bg-sky-400/[0.035] p-8 sm:p-10"
        >
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-sky-400">
                NWIS ROCKET LEAGUE
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                Follow the tournament.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Keep up with every match, player, team, statistic, and
                highlight throughout the tournament.
              </p>
            </div>

            <Link
              href="/players"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:border-sky-400/20 hover:bg-sky-400/10"
            >
              View Players
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}