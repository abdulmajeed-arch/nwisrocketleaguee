"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Edit3,
  Plus,
  Search,
  Trash2,
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
  nationality: string | null;
  rocket_league_rank: string | null;
  created_at: string;
  updated_at: string;
};

const ranks = [
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

const sections = ["A", "B", "C", "D", "E"];

export default function AdminPlayersClient({
  initialPlayers,
}: {
  initialPlayers: Player[];
}) {
  const supabase = createClient();

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [nationality, setNationality] = useState("");
  const [rank, setRank] = useState("Unranked");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return players;

    return players.filter((player) =>
      [
        player.full_name,
        player.nationality,
        player.rocket_league_rank,
        player.section,
        player.grade?.toString(),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [players, search]);

  function resetForm() {
    setFullName("");
    setPhotoUrl("");
    setGrade("");
    setSection("");
    setNationality("");
    setRank("Unranked");
    setEditingPlayer(null);
    setError("");
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(player: Player) {
    setEditingPlayer(player);

    setFullName(player.full_name);
    setPhotoUrl(player.photo_url ?? "");
    setGrade(player.grade?.toString() ?? "");
    setSection(player.section);
    setNationality(player.nationality ?? "");
    setRank(player.rocket_league_rank ?? "Unranked");

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Player name is required.");
      return;
    }

    if (!grade) {
      setError("Please select a grade.");
      return;
    }

    if (!section) {
      setError("Please select a section.");
      return;
    }

    setSaving(true);

    const payload = {
      full_name: fullName.trim(),
      photo_url: photoUrl.trim() || null,
      grade: Number(grade),
      section,
      nationality: nationality.trim() || null,
      rocket_league_rank: rank,
    };

    if (editingPlayer) {
      const { data, error: updateError } = await supabase
        .from("players")
        .update(payload)
        .eq("id", editingPlayer.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setPlayers((current) =>
        current.map((player) =>
          player.id === editingPlayer.id ? data : player
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("players")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setPlayers((current) =>
        [...current, data].sort((a, b) =>
          a.full_name.localeCompare(b.full_name)
        )
      );
    }

    setSaving(false);
    setModalOpen(false);
    resetForm();
  }

  async function handleDelete(player: Player) {
    const confirmed = window.confirm(
      `Delete ${player.full_name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(player.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(null);
      return;
    }

    setPlayers((current) =>
      current.filter((item) => item.id !== player.id)
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
              <UserRound className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Player Management
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Players
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Manage every player competing in the NWIS Rocket League
              tournament.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 transition-all duration-200 hover:bg-sky-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.18)]"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </button>
        </div>

        {/* SEARCH */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search players..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
            />
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {filteredPlayers.length}{" "}
            {filteredPlayers.length === 1 ? "player" : "players"}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* PLAYERS */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          {filteredPlayers.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="group flex flex-col gap-5 px-5 py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
                >
                  {/* PLAYER */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035]">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-5 w-5 text-slate-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">
                        {player.full_name}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span>
                          Grade {player.grade}
                          {player.section}
                        </span>

                        {player.nationality && (
                          <>
                            <span>•</span>
                            <span>{player.nationality}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RANK */}
                  <div className="sm:w-44">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-700 sm:hidden">
                      Rank
                    </p>

                    <span className="inline-flex rounded-lg border border-sky-400/10 bg-sky-400/[0.05] px-3 py-1.5 text-[10px] font-bold text-sky-300">
                      {player.rocket_league_rank ?? "Unranked"}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(player)}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-bold text-slate-500 transition-all hover:border-sky-400/20 hover:bg-sky-400/[0.05] hover:text-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(player)}
                      disabled={deleting === player.id}
                      className="flex items-center gap-2 rounded-lg border border-red-400/10 bg-red-400/[0.03] px-3 py-2 text-[10px] font-bold text-red-400/70 transition-all hover:border-red-400/20 hover:bg-red-400/[0.06] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleting === player.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <UserRound className="mx-auto h-8 w-8 text-slate-700" />

              <p className="mt-4 text-sm font-bold text-slate-400">
                {search ? "No players found" : "No players yet"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {search
                  ? "Try a different search."
                  : "Add your first tournament player."}
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
                  {editingPlayer ? "Edit Player" : "New Player"}
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  {editingPlayer
                    ? editingPlayer.full_name
                    : "Add Tournament Player"}
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
              <div className="grid gap-5 sm:grid-cols-2">
                {/* NAME */}
                <Field label="Full Name" required>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="e.g. Abdulmajeed Mohieddeen"
                    className={inputClass}
                  />
                </Field>

                {/* PHOTO */}
                <Field label="Photo URL">
                  <input
                    value={photoUrl}
                    onChange={(event) => setPhotoUrl(event.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>

                {/* GRADE */}
                <Field label="Grade" required>
                  <select
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select grade</option>
                    {Array.from({ length: 12 }, (_, index) => index + 1).map(
                      (value) => (
                        <option key={value} value={value}>
                          Grade {value}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                {/* SECTION */}
                <Field label="Section" required>
                  <select
                    value={section}
                    onChange={(event) => setSection(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select section</option>
                    {sections.map((value) => (
                      <option key={value} value={value}>
                        Section {value}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* NATIONALITY */}
                <Field label="Nationality">
                  <input
                    value={nationality}
                    onChange={(event) =>
                      setNationality(event.target.value)
                    }
                    placeholder="e.g. Saudi"
                    className={inputClass}
                  />
                </Field>

                {/* RANK */}
                <Field label="Rocket League Rank">
                  <select
                    value={rank}
                    onChange={(event) => setRank(event.target.value)}
                    className={inputClass}
                  >
                    {ranks.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* FORM ACTIONS */}
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
                    : editingPlayer
                      ? "Save Changes"
                      : "Create Player"}
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
        {required && <span className="ml-1 text-sky-400">*</span>}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-sky-400/30 focus:bg-white/[0.04] [&>option]:bg-[#090d16]";