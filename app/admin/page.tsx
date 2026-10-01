import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Film,
  Gamepad2,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
  await supabase.rpc("is_admin");

if (adminError || !isAdmin) {
  redirect("/admin/login");
}

  const [
    { count: playerCount },
    { count: teamCount },
    { count: matchCount },
    { count: highlightCount },
    { data: upcomingMatches },
  ] = await Promise.all([
    supabase
      .from("players")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("teams")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("matches")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("highlights")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("matches")
      .select(`
        id,
        scheduled_at,
        status,
        team_a:teams!matches_team_a_id_fkey (
          id,
          name
        ),
        team_b:teams!matches_team_b_id_fkey (
          id,
          name
        )
      `)
      .eq("status", "upcoming")
      .order("scheduled_at", { ascending: true })
      .limit(5),
  ]);

  const statCards = [
    {
      label: "Players",
      value: playerCount ?? 0,
      icon: UserRound,
      href: "/admin/players",
    },
    {
      label: "Teams",
      value: teamCount ?? 0,
      icon: Users,
      href: "/admin/teams",
    },
    {
      label: "Matches",
      value: matchCount ?? 0,
      icon: CalendarDays,
      href: "/admin/matches",
    },
    {
      label: "Highlights",
      value: highlightCount ?? 0,
      icon: Film,
      href: "/admin/highlights",
    },
  ];

  return (
    <main className="min-h-screen px-6 pb-24 pt-36 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1350px]">

        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Administrator Access
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Tournament Control
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Manage the NWIS Rocket League tournament from one place.
              Players, teams, matches, statistics, and highlights.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/[0.08]">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Signed in as
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-xs font-semibold text-slate-300">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-400" />
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-black tracking-tight text-white">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* MANAGEMENT */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
                Management
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                Tournament Data
              </h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ManagementCard
              href="/admin/players"
              icon={UserRound}
              title="Players"
              description="Add, edit, remove, and assign player information."
            />

            <ManagementCard
              href="/admin/teams"
              icon={Users}
              title="Teams"
              description="Create teams and manage their two-player rosters."
            />

            <ManagementCard
              href="/admin/matches"
              icon={CalendarDays}
              title="Matches"
              description="Schedule matches and record completed match statistics."
            />

            <ManagementCard
              href="/admin/highlights"
              icon={Film}
              title="Highlights"
              description="Publish tournament moments and video highlights."
            />
          </div>
        </section>

        {/* UPCOMING MATCHES */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
                Schedule
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                Upcoming Matches
              </h2>
            </div>

            <Link
              href="/admin/matches"
              className="flex items-center gap-1 text-xs font-bold text-slate-500 transition-colors hover:text-sky-400"
            >
              Manage
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
            {upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="divide-y divide-white/[0.05]">
                {upcomingMatches.map((match) => {
                  const teamA = Array.isArray(match.team_a)
                    ? match.team_a[0]
                    : match.team_a;

                  const teamB = Array.isArray(match.team_b)
                    ? match.team_b[0]
                    : match.team_b;

                  return (
                    <div
                      key={match.id}
                      className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/10 bg-sky-400/[0.05]">
                          <Gamepad2 className="h-4 w-4 text-sky-400" />
                        </div>

                        <div>
                          <div className="flex items-center gap-3 text-sm font-bold text-white">
                            <span>
                              {teamA?.name ?? "Team A"}
                            </span>

                            <span className="text-[10px] font-bold text-slate-700">
                              VS
                            </span>

                            <span>
                              {teamB?.name ?? "Team B"}
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-600">
                            {new Intl.DateTimeFormat("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(
                              new Date(match.scheduled_at)
                            )}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/admin/matches`}
                        className="flex w-fit items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-bold text-slate-500 transition-all hover:border-sky-400/20 hover:bg-sky-400/[0.05] hover:text-white"
                      >
                        Edit Match
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-slate-700" />

                <p className="mt-4 text-sm font-bold text-slate-400">
                  No upcoming matches
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Scheduled matches will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* QUICK SETTINGS */}
        <section className="mt-10">
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-sky-400/[0.06] to-transparent p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.06]">
                  <Settings className="h-5 w-5 text-sky-400" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Tournament Administration
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your account currently has administrator access.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Secure
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function ManagementCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
          <Icon className="h-5 w-5 text-sky-400" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">
            {title}
          </h3>

          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition-all duration-200 group-hover:translate-x-1 group-hover:text-sky-400" />
    </Link>
  );
}