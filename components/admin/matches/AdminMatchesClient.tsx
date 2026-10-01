"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Gamepad2,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Player = {
  id: string;
  full_name: string;
  photo_url: string | null;
  grade: number | null;
  section: string;
  rocket_league_rank: string | null;
};

type TeamPlayer = {
  player_id: string;
  players: Player | Player[] | null;
};

type Team = {
  id: string;
  name: string;
  team_players: TeamPlayer[];
};

type MatchStat = {
  id: string;
  player_id: string;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
};

type MatchStage =
  | "league"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";

type Match = {
  id: string;
  scheduled_at: string;
  status: "upcoming" | "completed";
  stage: MatchStage;
  team_a_id: string;
  team_b_id: string;
  team_a_score: number;
  team_b_score: number;
  teams_a:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
  teams_b:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
  match_player_stats: MatchStat[];
};

type PlayerStatForm = {
  goals: number;
  assists: number;
  saves: number;
  shots: number;
};

function getTeam(
  team: Match["teams_a"] | Match["teams_b"]
) {
  return Array.isArray(team) ? team[0] : team;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

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

function stageDescription(stage: MatchStage) {
  switch (stage) {
    case "round_of_16":
      return "Round of 16 playoff";
    case "quarterfinal":
      return "Quarterfinal playoff";
    case "semifinal":
      return "Playoff semifinal";
    case "final":
      return "Championship final";
    default:
      return "League phase";
  }
}

export default function AdminMatchesClient({
  initialMatches,
  initialTeams,
  initialPlayers,
}: {
  initialMatches: Match[];
  initialTeams: Team[];
  initialPlayers: Player[];
}) {
  const supabase = createClient();

  const [matches, setMatches] =
    useState<Match[]>(initialMatches);

  const [teams] = useState<Team[]>(initialTeams);
  const [players] = useState<Player[]>(initialPlayers);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed"
  >("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] =
    useState<Match | null>(null);

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [status, setStatus] = useState<
    "upcoming" | "completed"
  >("upcoming");

  const [stage, setStage] =
    useState<MatchStage>("league");

  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);

  const [playerStats, setPlayerStats] = useState<
    Record<string, PlayerStatForm>
  >({});

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return matches.filter((match) => {
      const a = getTeam(match.teams_a);
      const b = getTeam(match.teams_b);

      const matchesFilter =
        filter === "all" || match.status === filter;

      const matchesSearch =
        !query ||
        `${a?.name ?? ""} ${b?.name ?? ""}`
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [matches, search, filter]);

  const selectedTeamA = teams.find(
    (team) => team.id === teamA
  );

  const selectedTeamB = teams.find(
    (team) => team.id === teamB
  );

  const selectedPlayers = useMemo(() => {
    const ids = new Set<string>();

    selectedTeamA?.team_players.forEach((item) => {
      ids.add(item.player_id);
    });

    selectedTeamB?.team_players.forEach((item) => {
      ids.add(item.player_id);
    });

    return players.filter((player) => ids.has(player.id));
  }, [selectedTeamA, selectedTeamB, players]);

  const calculatedTeamAScore = selectedTeamA
    ? selectedTeamA.team_players.reduce((total, item) => {
        return (
          total +
          (playerStats[item.player_id]?.goals ?? 0)
        );
      }, 0)
    : 0;

  const calculatedTeamBScore = selectedTeamB
    ? selectedTeamB.team_players.reduce((total, item) => {
        return (
          total +
          (playerStats[item.player_id]?.goals ?? 0)
        );
      }, 0)
    : 0;

  function resetForm() {
    setTeamA("");
    setTeamB("");
    setScheduledAt("");
    setStatus("upcoming");
    setStage("league");
    setTeamAScore(0);
    setTeamBScore(0);
    setPlayerStats({});
    setEditingMatch(null);
    setError("");
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(match: Match) {
    const a = getTeam(match.teams_a);
    const b = getTeam(match.teams_b);

    setEditingMatch(match);

    setTeamA(a?.id ?? match.team_a_id);
    setTeamB(b?.id ?? match.team_b_id);

    setScheduledAt(
      toDateTimeLocal(match.scheduled_at)
    );

    setStatus(match.status);
    setStage(match.stage ?? "league");

    setTeamAScore(match.team_a_score ?? 0);
    setTeamBScore(match.team_b_score ?? 0);

    const existingStats: Record<
      string,
      PlayerStatForm
    > = {};

    match.match_player_stats.forEach((stat) => {
      existingStats[stat.player_id] = {
        goals: stat.goals ?? 0,
        assists: stat.assists ?? 0,
        saves: stat.saves ?? 0,
        shots: stat.shots ?? 0,
      };
    });

    setPlayerStats(existingStats);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  function updatePlayerStat(
    playerId: string,
    field: keyof PlayerStatForm,
    value: string
  ) {
    const number = Math.max(0, Number(value) || 0);

    setPlayerStats((current) => ({
      ...current,
      [playerId]: {
        goals: current[playerId]?.goals ?? 0,
        assists: current[playerId]?.assists ?? 0,
        saves: current[playerId]?.saves ?? 0,
        shots: current[playerId]?.shots ?? 0,
        [field]: number,
      },
    }));
  }

  function updateScore(
    setter: (value: number) => void,
    value: string
  ) {
    setter(Math.max(0, Number(value) || 0));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!teamA || !teamB) {
      setError("Please select both teams.");
      return;
    }

    if (teamA === teamB) {
      setError("A team cannot play against itself.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    if (
      status === "completed" &&
      selectedPlayers.length === 0
    ) {
      setError(
        "The selected teams must have players before completing a match."
      );
      return;
    }

    if (status === "completed") {
      if (teamAScore === teamBScore) {
        setError(
          "Completed Rocket League matches cannot end in a draw. Please enter a winning score."
        );
        return;
      }

      if (calculatedTeamAScore !== teamAScore) {
        setError(
          `${selectedTeamA?.name ?? "Team A"} player goals add up to ${calculatedTeamAScore}, but the team score is ${teamAScore}.`
        );
        return;
      }

      if (calculatedTeamBScore !== teamBScore) {
        setError(
          `${selectedTeamB?.name ?? "Team B"} player goals add up to ${calculatedTeamBScore}, but the team score is ${teamBScore}.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      let matchId = editingMatch?.id;

      const matchPayload = {
        team_a_id: teamA,
        team_b_id: teamB,
        scheduled_at: new Date(
          scheduledAt
        ).toISOString(),
        status,
        stage,
        team_a_score:
          status === "completed" ? teamAScore : 0,
        team_b_score:
          status === "completed" ? teamBScore : 0,
      };

      if (editingMatch) {
        const {
          data: updatedMatch,
          error: updateError,
        } = await supabase
          .from("matches")
          .update(matchPayload)
          .eq("id", editingMatch.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        matchId = updatedMatch.id;

        const { error: deleteStatsError } =
          await supabase
            .from("match_player_stats")
            .delete()
            .eq("match_id", matchId);

        if (deleteStatsError) {
          throw deleteStatsError;
        }
      } else {
        const {
          data: newMatch,
          error: insertError,
        } = await supabase
          .from("matches")
          .insert(matchPayload)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        matchId = newMatch.id;
      }

      if (!matchId) {
        throw new Error(
          "Unable to determine match ID."
        );
      }

      if (status === "completed") {
        const statsToInsert = selectedPlayers.map(
          (player) => {
            const stats =
              playerStats[player.id] ?? {
                goals: 0,
                assists: 0,
                saves: 0,
                shots: 0,
              };

            return {
              match_id: matchId,
              player_id: player.id,
              goals: stats.goals,
              assists: stats.assists,
              saves: stats.saves,
              shots: stats.shots,
            };
          }
        );

        if (statsToInsert.length > 0) {
          const { error: statsError } =
            await supabase
              .from("match_player_stats")
              .insert(statsToInsert);

          if (statsError) {
            throw statsError;
          }
        }
      }

      const {
        data: refreshedMatch,
        error: refreshError,
      } = await supabase
        .from("matches")
        .select(`
          id,
          scheduled_at,
          status,
          stage,
          team_a_id,
          team_b_id,
          team_a_score,
          team_b_score,
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
            shots
          )
        `)
        .eq("id", matchId)
        .single();

      if (refreshError) {
        throw refreshError;
      }

      setMatches((current) => {
        const exists = current.some(
          (match) => match.id === refreshedMatch.id
        );

        const next = exists
          ? current.map((match) =>
              match.id === refreshedMatch.id
                ? refreshedMatch
                : match
            )
          : [...current, refreshedMatch];

        return next.sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime()
        );
      });

      setSaving(false);
      setModalOpen(false);
      resetForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong."
      );

      setSaving(false);
    }
  }

  async function handleDelete(match: Match) {
    const a = getTeam(match.teams_a);
    const b = getTeam(match.teams_b);

    const confirmed = window.confirm(
      `Delete ${a?.name ?? "Team A"} vs ${
        b?.name ?? "Team B"
      }? This will also remove its player statistics and highlights.`
    );

    if (!confirmed) return;

    setDeleting(match.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("matches")
      .delete()
      .eq("id", match.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(null);
      return;
    }

    setMatches((current) =>
      current.filter((item) => item.id !== match.id)
    );

    setDeleting(null);
  }

  return (
    <main className="min-h-screen px-6 pb-24 pt-36 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1350px]">
        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-sky-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Match Management
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Matches
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Schedule league and playoff matches, record
              results, and manage player statistics.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 transition-all duration-200 hover:bg-sky-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.18)]"
          >
            <Plus className="h-4 w-4" />
            Add Match
          </button>
        </div>

        {/* FILTERS */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search teams..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
            {[
              ["all", "All"],
              ["upcoming", "Upcoming"],
              ["completed", "Completed"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setFilter(
                    value as
                      | "all"
                      | "upcoming"
                      | "completed"
                  )
                }
                className={`rounded-lg px-4 py-2 text-[10px] font-bold transition-all ${
                  filter === value
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-600 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error && !modalOpen && (
          <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* MATCH LIST */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          {filteredMatches.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {filteredMatches.map((match) => {
                const a = getTeam(match.teams_a);
                const b = getTeam(match.teams_b);

                return (
                  <div
                    key={match.id}
                    className="group flex flex-col gap-5 px-5 py-5 transition-colors hover:bg-white/[0.02] sm:px-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* TEAMS */}
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/10 bg-sky-400/[0.05]">
                          {match.status === "completed" ? (
                            <Trophy className="h-5 w-5 text-sky-400" />
                          ) : (
                            <Gamepad2 className="h-5 w-5 text-sky-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-black text-white">
                              {a?.name ?? "Team A"}
                            </span>

                            {match.status ===
                            "completed" ? (
                              <span className="text-sm font-black text-slate-300">
                                {match.team_a_score} —{" "}
                                {match.team_b_score}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-700">
                                VS
                              </span>
                            )}

                            <span className="text-sm font-black text-white">
                              {b?.name ?? "Team B"}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <Clock3 className="h-3 w-3" />
                              {formatDate(
                                match.scheduled_at
                              )}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-800" />

                            <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 font-bold text-slate-500">
                              {stageLabel(match.stage)}
                            </span>

                            <span className="flex items-center gap-1.5">
                              {match.status ===
                              "completed" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Clock3 className="h-3 w-3 text-sky-400" />
                                  Upcoming
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            openEditModal(match)
                          }
                          className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-bold text-slate-500 transition-all hover:border-sky-400/20 hover:bg-sky-400/[0.05] hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(match)
                          }
                          disabled={
                            deleting === match.id
                          }
                          className="flex items-center gap-2 rounded-lg border border-red-400/10 bg-red-400/[0.03] px-3 py-2 text-[10px] font-bold text-red-400/70 transition-all hover:border-red-400/20 hover:bg-red-400/[0.06] hover:text-red-300 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />

                          {deleting === match.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>

                    {/* PLAYER STAT SUMMARY */}
                    {match.status === "completed" &&
                      match.match_player_stats.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-4">
                          <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-700">
                            Stats recorded
                          </span>

                          <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-semibold text-slate-600">
                            {
                              match.match_player_stats
                                .length
                            }{" "}
                            Players
                          </span>

                          <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-semibold text-slate-600">
                            {match.team_a_score +
                              match.team_b_score}{" "}
                            Goals
                          </span>

                          <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-semibold text-slate-600">
                            {match.match_player_stats.reduce(
                              (sum, stat) =>
                                sum + stat.assists,
                              0
                            )}{" "}
                            Assists
                          </span>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-slate-700" />

              <p className="mt-4 text-sm font-bold text-slate-400">
                {search || filter !== "all"
                  ? "No matches found"
                  : "No matches yet"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {search || filter !== "all"
                  ? "Try changing your filters."
                  : "Schedule your first tournament match."}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* MATCH MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#090d16] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-400">
                  {editingMatch
                    ? "Edit Match"
                    : "New Match"}
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {editingMatch
                    ? "Manage Tournament Match"
                    : "Schedule Match"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-500 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {/* BASIC MATCH INFO */}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Team A" required>
                  <select
                    value={teamA}
                    onChange={(event) => {
                      setTeamA(event.target.value);

                      if (
                        event.target.value ===
                        teamB
                      ) {
                        setTeamB("");
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">
                      Select Team A
                    </option>

                    {teams.map((team) => (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={team.id === teamB}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Team B" required>
                  <select
                    value={teamB}
                    onChange={(event) => {
                      setTeamB(event.target.value);

                      if (
                        event.target.value ===
                        teamA
                      ) {
                        setTeamA("");
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">
                      Select Team B
                    </option>

                    {teams.map((team) => (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={team.id === teamA}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Date & Time" required>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) =>
                      setScheduledAt(
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Match Stage" required>
                  <select
                    value={stage}
                    onChange={(event) =>
                      setStage(
                        event.target.value as MatchStage
                      )
                    }
                    className={inputClass}
                  >
                    <option value="league">
  League Phase
</option>

<option value="round_of_16">
  Round of 16
</option>

<option value="quarterfinal">
  Quarterfinal
</option>

<option value="semifinal">
  Semifinal
</option>

<option value="final">
  Final
</option>
                  </select>
                </Field>

                <Field label="Match Status">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value as
                          | "upcoming"
                          | "completed"
                      )
                    }
                    className={inputClass}
                  >
                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </Field>
              </div>

              {/* SCORE */}
              {teamA && teamB && (
                <div className="mt-7 rounded-2xl border border-sky-400/10 bg-sky-400/[0.035] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-sky-400">
                        Match Result
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        {stageDescription(stage)}
                      </p>
                    </div>

                    {status === "completed" && (
                      <span className="rounded-md border border-emerald-400/10 bg-emerald-400/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        Final Score
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
                    {/* TEAM A SCORE */}
                    <div>
                      <p className="mb-2 truncate text-center text-xs font-bold text-white">
                        {selectedTeamA?.name}
                      </p>

                      <input
                        type="number"
                        min="0"
                        value={teamAScore}
                        disabled={
                          status !== "completed"
                        }
                        onChange={(event) =>
                          updateScore(
                            setTeamAScore,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-4 text-center text-3xl font-black text-white outline-none transition-all focus:border-sky-400/30 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>

                    <span className="pb-4 text-xl font-black text-slate-700">
                      —
                    </span>

                    {/* TEAM B SCORE */}
                    <div>
                      <p className="mb-2 truncate text-center text-xs font-bold text-white">
                        {selectedTeamB?.name}
                      </p>

                      <input
                        type="number"
                        min="0"
                        value={teamBScore}
                        disabled={
                          status !== "completed"
                        }
                        onChange={(event) =>
                          updateScore(
                            setTeamBScore,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-4 text-center text-3xl font-black text-white outline-none transition-all focus:border-sky-400/30 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {status === "completed" && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <ScoreCheck
                        label={`${selectedTeamA?.name ?? "Team A"} player goals`}
                        value={calculatedTeamAScore}
                        target={teamAScore}
                      />

                      <ScoreCheck
                        label={`${selectedTeamB?.name ?? "Team B"} player goals`}
                        value={calculatedTeamBScore}
                        target={teamBScore}
                      />
                    </div>
                  )}

                  {status === "upcoming" && (
                    <p className="mt-4 text-center text-[10px] text-slate-600">
                      Score fields become available when the
                      match is marked completed.
                    </p>
                  )}
                </div>
              )}

              {/* PLAYER STATS */}
              {status === "completed" &&
                selectedPlayers.length > 0 && (
                  <div className="mt-7">
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-400">
                        Player Statistics
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Enter player performance from this
                        match. Player goals must add up to the
                        final team score.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                      <div className="hidden grid-cols-[1fr_70px_70px_70px_70px] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 sm:grid">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                          Player
                        </span>

                        <span className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-700">
                          Goals
                        </span>

                        <span className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-700">
                          Assists
                        </span>

                        <span className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-700">
                          Saves
                        </span>

                        <span className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-700">
                          Shots
                        </span>
                      </div>

                      <div className="divide-y divide-white/[0.05]">
                        {selectedPlayers.map(
                          (player) => {
                            const stat =
                              playerStats[
                                player.id
                              ] ?? {
                                goals: 0,
                                assists: 0,
                                saves: 0,
                                shots: 0,
                              };

                            const team =
                              selectedTeamA?.team_players.some(
                                (item) =>
                                  item.player_id ===
                                  player.id
                              )
                                ? selectedTeamA
                                : selectedTeamB;

                            return (
                              <div
                                key={player.id}
                                className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_70px_70px_70px_70px] sm:items-center sm:gap-2"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.035]">
                                    {player.photo_url ? (
                                      <img
                                        src={
                                          player.photo_url
                                        }
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Users className="h-4 w-4 text-slate-600" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-white">
                                      {player.full_name}
                                    </p>

                                    <p className="mt-0.5 text-[9px] text-slate-600">
                                      {team?.name ?? ""}
                                    </p>
                                  </div>
                                </div>

                                <StatInput
                                  label="Goals"
                                  value={stat.goals}
                                  onChange={(value) =>
                                    updatePlayerStat(
                                      player.id,
                                      "goals",
                                      value
                                    )
                                  }
                                />

                                <StatInput
                                  label="Assists"
                                  value={stat.assists}
                                  onChange={(value) =>
                                    updatePlayerStat(
                                      player.id,
                                      "assists",
                                      value
                                    )
                                  }
                                />

                                <StatInput
                                  label="Saves"
                                  value={stat.saves}
                                  onChange={(value) =>
                                    updatePlayerStat(
                                      player.id,
                                      "saves",
                                      value
                                    )
                                  }
                                />

                                <StatInput
                                  label="Shots"
                                  value={stat.shots}
                                  onChange={(value) =>
                                    updatePlayerStat(
                                      player.id,
                                      "shots",
                                      value
                                    )
                                  }
                                />
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {status === "completed" &&
                selectedPlayers.length === 0 &&
                teamA &&
                teamB && (
                  <div className="mt-7 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-4 py-4">
                    <p className="text-xs font-bold text-amber-300">
                      No players found
                    </p>

                    <p className="mt-1 text-[10px] text-amber-200/50">
                      Both teams need players before player
                      statistics can be recorded.
                    </p>
                  </div>
                )}

              {error && (
                <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-3 text-sm font-bold text-slate-400 transition-colors hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 transition-all hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingMatch
                      ? "Save Match"
                      : "Create Match"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}

        {required && (
          <span className="ml-1 text-sky-400">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function StatInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-bold text-slate-700 sm:hidden">
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-2 text-center text-xs font-bold text-white outline-none transition-all focus:border-sky-400/30 focus:bg-white/[0.04]"
      />
    </label>
  );
}

function ScoreCheck({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const matches = value === target;

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
        matches
          ? "border-emerald-400/10 bg-emerald-400/[0.035]"
          : "border-amber-400/10 bg-amber-400/[0.035]"
      }`}
    >
      <span className="truncate text-[9px] font-semibold text-slate-500">
        {label}
      </span>

      <span
        className={`ml-3 text-[10px] font-black ${
          matches
            ? "text-emerald-400"
            : "text-amber-300"
        }`}
      >
        {value} / {target}
      </span>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-sky-400/30 focus:bg-white/[0.04] [&>option]:bg-[#090d16]";