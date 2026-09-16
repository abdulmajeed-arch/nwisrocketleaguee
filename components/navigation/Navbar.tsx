"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Shield,
  Trophy,
} from "lucide-react";

const links = [
  { name: "Home", href: "/" },
  { name: "Players", href: "/players" },
  { name: "Teams", href: "/teams" },
  { name: "Matches", href: "/matches" },
  { name: "Stats", href: "/stats" },
  { name: "Highlights", href: "/highlights" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <nav className="mx-auto flex h-[70px] max-w-[1380px] items-center rounded-2xl border border-white/[0.08] bg-[#080b13]/90 px-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-4">
        {/* BRAND */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 hover:bg-white/[0.035]"
        >


          <div className="hidden sm:block">
            <div className="text-[13px] font-black tracking-tight text-white">
              New World
            </div>

            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Rocket League
            </div>
          </div>
        </Link>

        {/* DIVIDER */}
        <div className="mx-4 hidden h-8 w-px bg-white/[0.07] lg:block" />

        {/* NAVIGATION */}
        <div className="min-w-0 flex-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center justify-center gap-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative rounded-xl px-3.5 py-2.5 text-[12px] font-bold transition-all duration-200 sm:px-4 sm:text-[13px] ${
                    active
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  {/* ACTIVE BACKGROUND */}
                  {active && (
                    <span className="absolute inset-0 rounded-xl border border-white/[0.07] bg-white/[0.055]" />
                  )}

                  {/* ACTIVE GLOW */}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                  )}

                  {/* HOVER BACKGROUND */}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl bg-white/[0.035] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  )}

                  <span className="relative">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ADMIN */}
        <div className="ml-2 hidden shrink-0 sm:block">
          <Link
            href="/admin"
            className="group flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-[12px] font-bold text-slate-400 transition-all duration-200 hover:border-sky-400/20 hover:bg-sky-400/[0.06] hover:text-white"
          >
            <Shield className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />

            <span>Admin</span>

            <ChevronRight className="h-3 w-3 text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-sky-400" />
          </Link>
        </div>
      </nav>
    </header>
  );
}