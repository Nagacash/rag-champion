"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export function AuthButtons() {
  const t = useTranslations("navigation");

  return (
    <>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox:
                "h-7 w-7 border border-slate-600/70 shadow-sm shadow-slate-900/80",
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[0.7rem] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100"
        >
          {t("signIn")}
        </Link>
      </SignedOut>
    </>
  );
}
