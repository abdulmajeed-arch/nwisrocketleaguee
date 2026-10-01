"use client";

import { motion } from "motion/react";
import {
  CalendarDays,
  ExternalLink,
  Play,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  scheduledAt: string;
  status: string;
  teamA: Team | null;
  teamB: Team | null;
};

type Highlight = {
  id: string;
  matchId: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
  match: Match | null;
};

type Props = {
  highlights: Highlight[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getVideoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    ) {
      let videoId = "";

      if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.replace("/", "");
      }

      if (parsed.hostname.includes("youtube.com")) {
        videoId = parsed.searchParams.get("v") ?? "";

        if (!videoId && parsed.pathname.startsWith("/embed/")) {
          videoId = parsed.pathname.split("/embed/")[1];
        }

        if (!videoId && parsed.pathname.startsWith("/shorts/")) {
          videoId = parsed.pathname.split("/shorts/")[1];
        }
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string) {
  try {
    const parsed = new URL(url);

    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") ?? "";

      if (!videoId && parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      }

      if (!videoId && parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1];
      }
    }

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    return null;
  } catch {
    return null;
  }
}

export default function HighlightsClient({
  highlights,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedHighlight, setSelectedHighlight] =
    useState<Highlight | null>(null);

  const filteredHighlights = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return highlights;
    }

    return highlights.filter((highlight) => {
      return (
        highlight.title.toLowerCase().includes(query) ||
        highlight.description?.toLowerCase().includes(query) ||
        highlight.match?.teamA?.name
          .toLowerCase()
          .includes(query) ||
        highlight.match?.teamB?.name
          .toLowerCase()
          .includes(query)
      );
    });
  }, [highlights, search]);

  return (
    <>
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
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Tournament Moments
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
              Highlights
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Watch the biggest plays, best moments, and standout action
              from the NWIS Rocket League tournament.
            </p>
          </motion.div>

          {/* SEARCH */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-10"
          >
            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search highlights or teams..."
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-400/30 focus:bg-white/[0.04]"
              />
            </div>
          </motion.div>

          {/* GRID */}
          {filteredHighlights.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHighlights.map((highlight, index) => {
                const thumbnail =
                  highlight.thumbnailUrl ||
                  getYouTubeThumbnail(highlight.videoUrl);

                return (
                  <motion.button
                    key={highlight.id}
                    type="button"
                    onClick={() =>
                      setSelectedHighlight(highlight)
                    }
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.06, 0.3),
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] text-left transition-colors duration-300 hover:border-sky-400/20 hover:bg-white/[0.04]"
                  >
                    {/* THUMBNAIL */}
                    <div className="relative aspect-video overflow-hidden bg-[#080b12]">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-400/[0.08] to-transparent">
                          <Trophy className="h-10 w-10 text-sky-400/30" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/45 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                          <Play
                            className="ml-0.5 h-5 w-5 fill-white text-white"
                          />
                        </div>
                      </div>

                      {highlight.match && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[10px] font-bold text-white">
                          <span className="truncate">
                            {highlight.match.teamA?.name ??
                              "Team A"}
                          </span>

                          <span className="text-slate-500">
                            vs
                          </span>

                          <span className="truncate">
                            {highlight.match.teamB?.name ??
                              "Team B"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-5">
                      <h2 className="line-clamp-2 text-base font-extrabold leading-6 text-white">
                        {highlight.title}
                      </h2>

                      {highlight.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {highlight.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5" />

                          {formatDate(highlight.createdAt)}
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 opacity-70 transition-opacity group-hover:opacity-100">
                          Watch
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-24 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                <Sparkles className="h-6 w-6 text-slate-600" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-white">
                No highlights yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Tournament highlights will appear here once the
                admin team publishes them.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* VIDEO MODAL */}
      {selectedHighlight && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
          onClick={() => setSelectedHighlight(null)}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090c14] shadow-2xl"
          >
            {/* VIDEO */}
            <div className="relative aspect-video bg-black">
              {getVideoEmbedUrl(
                selectedHighlight.videoUrl
              ) ? (
                <iframe
                  src={getVideoEmbedUrl(
                    selectedHighlight.videoUrl
                  )!}
                  title={selectedHighlight.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <a
                    href={selectedHighlight.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                  >
                    Open Video
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedHighlight(null)
                }
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-6 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-white sm:text-2xl">
                    {selectedHighlight.title}
                  </h2>

                  {selectedHighlight.description && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                      {selectedHighlight.description}
                    </p>
                  )}
                </div>

                {selectedHighlight.match && (
                  <div className="shrink-0 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-white">
                      <span>
                        {selectedHighlight.match.teamA?.name ??
                          "Team A"}
                      </span>

                      <span className="text-slate-600">
                        VS
                      </span>

                      <span>
                        {selectedHighlight.match.teamB?.name ??
                          "Team B"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" />
                Published {formatDate(selectedHighlight.createdAt)}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}