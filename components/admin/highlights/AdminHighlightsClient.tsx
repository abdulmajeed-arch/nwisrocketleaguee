"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Edit3,
  ExternalLink,
  Film,
  Play,
  Plus,
  Search,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  scheduled_at: string;
  status: "upcoming" | "completed";
  team_a_id: string;
  team_b_id: string;
  teams_a: Team | Team[] | null;
  teams_b: Team | Team[] | null;
};

type Highlight = {
  id: string;
  match_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

function getTeam(team: Team | Team[] | null | undefined) {
  if (!team) return null;
  return Array.isArray(team) ? team[0] ?? null : team;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getYoutubeId(url: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtube-nocookie.com")
    ) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return videoId;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);

      if (parts[0] === "shorts" || parts[0] === "embed") {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getAutomaticThumbnail(videoUrl: string) {
  const youtubeId = getYoutubeId(videoUrl);

  if (!youtubeId) {
    return null;
  }

  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function AdminHighlightsClient({
  initialHighlights,
  initialMatches,
}: {
  initialHighlights: Highlight[];
  initialMatches: Match[];
}) {
  const supabase = createClient();

  const [highlights, setHighlights] =
    useState<Highlight[]>(initialHighlights);

  const [matches] = useState<Match[]>(initialMatches);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] =
    useState<Highlight | null>(null);

  const [matchId, setMatchId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filteredHighlights = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return highlights;
    }

    return highlights.filter((highlight) => {
      const match = matches.find(
        (item) => item.id === highlight.match_id
      );

      const teamA = getTeam(match?.teams_a)?.name ?? "";
      const teamB = getTeam(match?.teams_b)?.name ?? "";

      return (
        highlight.title.toLowerCase().includes(query) ||
        (highlight.description ?? "").toLowerCase().includes(query) ||
        teamA.toLowerCase().includes(query) ||
        teamB.toLowerCase().includes(query)
      );
    });
  }, [highlights, matches, search]);

  function resetForm() {
    setMatchId("");
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setEditingHighlight(null);
    setError("");
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(highlight: Highlight) {
    setEditingHighlight(highlight);
    setMatchId(highlight.match_id);
    setTitle(highlight.title);
    setDescription(highlight.description ?? "");
    setVideoUrl(highlight.video_url);
    setThumbnailUrl(highlight.thumbnail_url ?? "");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  function getMatch(matchId: string) {
    return matches.find((match) => match.id === matchId) ?? null;
  }

  function getMatchLabel(match: Match | null) {
    if (!match) {
      return "Unknown Match";
    }

    const teamA = getTeam(match.teams_a)?.name ?? "Team A";
    const teamB = getTeam(match.teams_b)?.name ?? "Team B";

    return `${teamA} vs ${teamB}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const selectedMatch = getMatch(matchId);

    if (!selectedMatch) {
      setError("Please select a completed match.");
      return;
    }

    if (selectedMatch.status !== "completed") {
      setError("Highlights can only be added to completed matches.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a highlight title.");
      return;
    }

    if (!videoUrl.trim()) {
      setError("Please enter a video URL.");
      return;
    }

    setSaving(true);

    try {
      const finalThumbnail =
        thumbnailUrl.trim() ||
        getAutomaticThumbnail(videoUrl.trim()) ||
        null;

      if (editingHighlight) {
        const { data, error: updateError } = await supabase
          .from("highlights")
          .update({
            match_id: matchId,
            title: title.trim(),
            description: description.trim() || null,
            video_url: videoUrl.trim(),
            thumbnail_url: finalThumbnail,
          })
          .eq("id", editingHighlight.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setHighlights((current) =>
          current.map((item) =>
            item.id === editingHighlight.id ? data : item
          )
        );
      } else {
        const { data, error: insertError } = await supabase
          .from("highlights")
          .insert({
            match_id: matchId,
            title: title.trim(),
            description: description.trim() || null,
            video_url: videoUrl.trim(),
            thumbnail_url: finalThumbnail,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setHighlights((current) => [data, ...current]);
      }

      setModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the highlight."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const highlight = highlights.find((item) => item.id === id);

    if (!highlight) return;

    const confirmed = window.confirm(
      `Delete "${highlight.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("highlights")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setHighlights((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the highlight."
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6">
      <div className="mx-auto max-w-[1380px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
              <Film className="h-4 w-4" />
              Content Management
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Highlights
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage tournament highlights, video links, thumbnails, and
              match associations.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            disabled={matches.length === 0}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-bold text-sky-300 transition-all duration-200 hover:border-sky-400/30 hover:bg-sky-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Add Highlight
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              <Film className="h-4 w-4" />
              Total Highlights
            </div>

            <div className="text-3xl font-black text-white">
              {highlights.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              <Trophy className="h-4 w-4" />
              Completed Matches
            </div>

            <div className="text-3xl font-black text-white">
              {matches.length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search highlights or matches..."
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
            />
          </div>
        </div>

        {/* Error */}
        {error && !modalOpen && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {filteredHighlights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
              <Film className="h-6 w-6 text-slate-600" />
            </div>

            <h2 className="text-lg font-bold text-white">
              {search ? "No highlights found" : "No highlights yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try changing your search."
                : "Add your first tournament highlight once a match has been completed."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHighlights.map((highlight) => {
              const match = getMatch(highlight.match_id);

              const thumbnail =
                highlight.thumbnail_url ||
                getAutomaticThumbnail(highlight.video_url);

              return (
                <article
                  key={highlight.id}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/[0.04]"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-[#090d16]">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-400/[0.08] to-transparent">
                        <Film className="h-10 w-10 text-slate-700" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                    <a
                      href={highlight.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-90 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-sky-400/40 hover:bg-sky-400/20"
                      aria-label={`Open ${highlight.title}`}
                    >
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </a>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                      <span className="rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-300 backdrop-blur-md">
                        Highlight
                      </span>

                      <a
                        href={highlight.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-white/10 bg-black/50 p-2 text-slate-300 backdrop-blur-md transition-colors hover:text-white"
                        aria-label="Open video"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h2 className="line-clamp-2 text-base font-black leading-6 text-white">
                        {highlight.title}
                      </h2>

                      {highlight.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                          {highlight.description}
                        </p>
                      )}
                    </div>

                    <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        Match
                      </div>

                      <div className="mt-1 text-sm font-bold text-slate-300">
                        {getMatchLabel(match)}
                      </div>

                      {match && (
                        <div className="mt-1 text-xs text-slate-600">
                          {formatDate(match.scheduled_at)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(highlight)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs font-bold text-slate-400 transition-all hover:border-sky-400/20 hover:bg-sky-400/[0.06] hover:text-white"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(highlight.id)}
                        disabled={deleting === highlight.id}
                        className="flex items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2.5 text-red-400 transition-all hover:border-red-400/20 hover:bg-red-400/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Delete highlight"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/[0.09] bg-[#0a0e17] shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
              <div>
                <div className="text-base font-black text-white">
                  {editingHighlight ? "Edit Highlight" : "Add Highlight"}
                </div>

                <div className="mt-1 text-xs text-slate-600">
                  Highlights can only be linked to completed matches.
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5 sm:p-6">
                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Match */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Completed Match
                  </label>

                  <select
                    value={matchId}
                    onChange={(event) => setMatchId(event.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0d121d] px-4 text-sm text-white outline-none transition-colors focus:border-sky-400/30"
                  >
                    <option value="">Select a completed match</option>

                    {matches.map((match) => (
                      <option key={match.id} value={match.id}>
                        {getMatchLabel(match)} —{" "}
                        {formatDate(match.scheduled_at)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Incredible Double Save"
                    required
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0d121d] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-sky-400/30"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0d121d] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-slate-700 focus:border-sky-400/30"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Video URL
                  </label>

                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(event) =>
                      setVideoUrl(event.target.value)
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    required
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0d121d] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-sky-400/30"
                  />

                  {getYoutubeId(videoUrl) && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      YouTube video detected — thumbnail will be generated automatically if needed.
                    </div>
                  )}
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Thumbnail URL
                    <span className="ml-2 normal-case tracking-normal text-slate-700">
                      Optional
                    </span>
                  </label>

                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(event) =>
                      setThumbnailUrl(event.target.value)
                    }
                    placeholder="Leave blank to use YouTube thumbnail"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0d121d] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-sky-400/30"
                  />
                </div>

                {/* Preview */}
                {(thumbnailUrl || getAutomaticThumbnail(videoUrl)) && (
                  <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    <div className="border-b border-white/[0.06] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      Thumbnail Preview
                    </div>

                    <img
                      src={
                        thumbnailUrl ||
                        getAutomaticThumbnail(videoUrl) ||
                        ""
                      }
                      alt="Thumbnail preview"
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-bold text-sky-300 transition-all hover:bg-sky-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : editingHighlight
                      ? "Save Changes"
                      : "Create Highlight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}