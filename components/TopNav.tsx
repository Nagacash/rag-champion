"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLocaleStore, type Locale } from "@/lib/locale-store";

const AuthButtons = dynamic(() => import("./AuthButtons").then((mod) => mod.AuthButtons), {
  ssr: false,
});

const linkKeys = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/query", key: "chat" as const },
  { href: "/upload", key: "upload" as const },
];

export function TopNav() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const otherLocale: Locale = locale === "de" ? "en" : "de";
  const otherLocaleLabel = otherLocale === "de" ? "DE" : "EN";

  const handleLanguageToggle = () => {
    setLocale(otherLocale);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_0_4px_rgba(15,23,42,0.9)]" />
          <span className="text-sm font-semibold tracking-tight text-slate-50">
            First Family RAG
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-xs font-medium text-slate-300/85">
          {linkKeys.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  active
                    ? "bg-slate-900 text-cyan-100 border border-cyan-400/70"
                    : "text-slate-300/80 hover:text-cyan-100 hover:bg-slate-900/70",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[0.7rem] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 transition-colors"
            aria-label={`Switch to ${otherLocaleLabel}`}
          >
            {otherLocaleLabel}
          </button>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

