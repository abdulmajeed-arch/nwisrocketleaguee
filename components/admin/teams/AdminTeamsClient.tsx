"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  Users,
  UserRound,
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
  id: string;
  player_id: string;
  players: Player | Player[] | null;
};

type Team = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  team_players: TeamPlayer[];
};

export default function AdminTeamsClient({
  initialTeams,
  initialPlayers,
}: {
  initialTeams: Team[];
  initialPlayers: Player[];
}) {
  const supabase = createClient();

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [players] = useState<Player[]>(initialPlayers);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const assignedPlayerIds = useMemo(() => {
    const ids = new Set<string>();

    teams.forEach((team) => {
      team.team_players.forEach((teamPlayer) => {
        ids.add(teamPlayer.player_id);
      });
    });

    return ids;
  }, [teams]);

  const availablePlayers = useMemo(() => {
    return players.filter((player) => {
      if (editingTeam) {
        const belongsToCurrentTeam = editingTeam.team_players.some(
          (teamPlayer) => teamPlayer.player_id === player.id
        );

        if (belongsToCurrentTeam) {
          return true;
        }
      }

      return !assignedPlayerIds.has(player.id);
    });
  }, [players, assignedPlayerIds, editingTeam]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return teams;

    return teams.filter((team) => {
      const playerNames = team.team_players
        .map((teamPlayer) => {
          const player = Array.isArray(teamPlayer.players)
            ? teamPlayer.players[0]
            : teamPlayer.players;

          return player?.full_name ?? "";
        })
        .join(" ");

      return `${team.name} ${playerNames}`
        .toLowerCase()
        .includes(query);
    });
  }, [teams, search]);

  function getPlayer(teamPlayer: TeamPlayer) {
    return Array.isArray(teamPlayer.players)
      ? teamPlayer.players[0]
      : teamPlayer.players;
  }

  function resetForm() {
    setTeamName("");
    setSelectedPlayers([]);
    setEditingTeam(null);
    setError("");
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(team: Team) {
    setEditingTeam(team);
    setTeamName(team.name);

    setSelectedPlayers(
      team.team_players.map((teamPlayer) => teamPlayer.player_id)
    );

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  function togglePlayer(playerId: string) {
    setSelectedPlayers((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }

      if (current.length >= 2) {
        return current;
      }

      return [...current, playerId];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanName = teamName.trim();

    if (!cleanName) {
      setError("Team name is required.");
      return;
    }

    if (selectedPlayers.length !== 2) {
      setError("Every team must have exactly 2 players.");
      return;
    }

    setSaving(true);

    try {
      if (editingTeam) {
        const { data: existingTeam, error: duplicateError } =
          await supabase
            .from("teams")
            .select("id")
            .ilike("name", cleanName)
            .neq("id", editingTeam.id)
            .maybeSingle();

        if (duplicateError) {
          throw duplicateError;
        }

        if (existingTeam) {
          throw new Error("A team with this name already exists.");
        }

        const { data: updatedTeam, error: updateError } =
          await supabase
            .from("teams")
            .update({
              name: cleanName,
            })
            .eq("id", editingTeam.id)
            .select()
            .single();

        if (updateError) {
          throw updateError;
        }

        const { error: deletePlayersError } = await supabase
          .from("team_players")
          .delete()
          .eq("team_id", editingTeam.id);

        if (deletePlayersError) {
          throw deletePlayersError;
        }

        const { error: insertPlayersError } = await supabase
          .from("team_players")
          .insert(
            selectedPlayers.map((playerId) => ({
              team_id: editingTeam.id,
              player_id: playerId,
            }))
          );

        if (insertPlayersError) {
          throw insertPlayersError;
        }

        const updatedPlayerData: TeamPlayer[] = selectedPlayers.map(
          (playerId, index) => ({
            id: `temporary-${editingTeam.id}-${playerId}-${index}`,
            player_id: playerId,
            players:
              players.find((player) => player.id === playerId) ?? null,
          })
        );

        setTeams((current) =>
          current
            .map((team) =>
              team.id === editingTeam.id
                ? {
                    ...team,
                    name: updatedTeam.name,
                    updated_at: updatedTeam.updated_at,
                    team_players: updatedPlayerData,
                  }
                : team
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        const { data: existingTeam, error: duplicateError } =
          await supabase
            .from("teams")
            .select("id")
            .ilike("name", cleanName)
            .maybeSingle();

        if (duplicateError) {
          throw duplicateError;
        }

        if (existingTeam) {
          throw new Error("A team with this name already exists.");
        }

        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: cleanName,
          })
          .select()
          .single();

        if (teamError) {
          throw teamError;
        }

        const { error: playersError } = await supabase
          .from("team_players")
          .insert(
            selectedPlayers.map((playerId) => ({
              team_id: newTeam.id,
              player_id: playerId,
            }))
          );

        if (playersError) {
          // Roll back the team if the roster insert fails.
          await supabase.from("teams").delete().eq("id", newTeam.id);
          throw playersError;
        }

        const newTeamPlayers: TeamPlayer[] = selectedPlayers.map(
          (playerId, index) => ({
            id: `temporary-${newTeam.id}-${playerId}-${index}`,
            player_id: playerId,
            players:
              players.find((player) => player.id === playerId) ?? null,
          })
        );

        setTeams((current) =>
          [
            ...current,
            {
              ...newTeam,
              team_players: newTeamPlayers,
            },
          ].sort((a, b) => a.name.localeCompare(b.name))
        );
      }

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

  async function handleDelete(team: Team) {
    const confirmed = window.confirm(
      `Delete ${team.name}? Its player assignments will also be removed.`
    );

    if (!confirmed) return;

    setDeleting(team.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(null);
      return;
    }

    setTeams((current) =>
      current.filter((item) => item.id !== team.id)
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
              <Users className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Team Management
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Teams
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Create teams and manage their two-player tournament rosters.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 transition-all duration-200 hover:bg-sky-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.18)]"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </button>
        </div>

        {/* SEARCH */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams or players..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
            />
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {filteredTeams.length}{" "}
            {filteredTeams.length === 1 ? "team" : "teams"}
          </div>
        </div>

        {/* ERROR */}
        {error && !modalOpen && (
          <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* TEAMS */}
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/20 hover:bg-white/[0.04]"
              >
                {/* TEAM HEADER */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/10 bg-sky-400/[0.05]">
                      <Users className="h-5 w-5 text-sky-400" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-white">
                        {team.name}
                      </h2>

                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                        {team.team_players.length}/2 Players
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(team)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-slate-600 transition-all hover:border-sky-400/20 hover:text-sky-400"
                      title="Edit team"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(team)}
                      disabled={deleting === team.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/10 bg-red-400/[0.025] text-red-400/60 transition-all hover:border-red-400/20 hover:text-red-300 disabled:opacity-40"
                      title="Delete team"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ROSTER */}
                <div className="mt-5 space-y-2">
                  {team.team_players.map((teamPlayer) => {
                    const player = getPlayer(teamPlayer);

                    if (!player) return null;

                    return (
                      <div
                        key={teamPlayer.id}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/10 px-3 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.035]">
                          {player.photo_url ? (
                            <img
                              src={player.photo_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4 text-slate-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-white">
                            {player.full_name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-600">
                            Grade {player.grade}
                            {player.section}
                          </p>
                        </div>

                        <span className="hidden rounded-md border border-sky-400/10 bg-sky-400/[0.04] px-2 py-1 text-[8px] font-bold text-sky-300 sm:inline-flex">
                          {player.rocket_league_rank ?? "Unranked"}
                        </span>
                      </div>
                    );
                  })}

                  {team.team_players.length < 2 && (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-amber-400/15 bg-amber-400/[0.025] px-3 py-4">
                      <p className="text-[10px] font-bold text-amber-300/70">
                        Roster incomplete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-20 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-700" />

              <p className="mt-4 text-sm font-bold text-slate-400">
                {search ? "No teams found" : "No teams yet"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {search
                  ? "Try a different search."
                  : "Create your first tournament team."}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#090d16] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-400">
                  {editingTeam ? "Edit Team" : "New Team"}
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {editingTeam
                    ? editingTeam.name
                    : "Create Tournament Team"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-500 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Team Name
                  <span className="ml-1 text-sky-400">*</span>
                </span>

                <input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="e.g. Velocity"
                  className={inputClass}
                />
              </label>

              {/* PLAYER SELECTION */}
              <div className="mt-6">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Team Players
                      <span className="ml-1 text-sky-400">*</span>
                    </span>

                    <p className="mt-1 text-xs text-slate-700">
                      Select exactly 2 players.
                    </p>
                  </div>

                  <span
                    className={`text-xs font-black ${
                      selectedPlayers.length === 2
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {selectedPlayers.length}/2
                  </span>
                </div>

                <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {availablePlayers.length > 0 ? (
                    availablePlayers.map((player) => {
                      const selected = selectedPlayers.includes(player.id);

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => togglePlayer(player.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            selected
                              ? "border-sky-400/30 bg-sky-400/[0.08]"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.035]">
                            {player.photo_url ? (
                              <img
                                src={player.photo_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-4 w-4 text-slate-600" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-white">
                              {player.full_name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-600">
                              Grade {player.grade}
                              {player.section} ·{" "}
                              {player.rocket_league_rank ?? "Unranked"}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              selected
                                ? "border-sky-400 bg-sky-400 text-slate-950"
                                : "border-white/[0.1] bg-transparent"
                            }`}
                          >
                            {selected && (
                              <span className="text-[11px] font-black">
                                ✓
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full rounded-xl border border-dashed border-white/[0.07] px-4 py-8 text-center">
                      <UserRound className="mx-auto h-6 w-6 text-slate-700" />

                      <p className="mt-3 text-xs font-bold text-slate-500">
                        No available players
                      </p>

                      <p className="mt-1 text-[10px] text-slate-700">
                        Players already assigned to teams are hidden.
                      </p>
                    </div>
                  )}
                </div>
              </div>

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
                    : editingTeam
                      ? "Save Changes"
                      : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-sky-400/30 focus:bg-white/[0.04] [&>option]:bg-[#090d16]";