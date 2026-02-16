"use client";

import { useEffect } from "react";
import { IntlProvider } from "next-intl";
import { useLocaleStore } from "@/lib/locale-store";
import enMessages from "@/locales/en/common.json";
import deMessages from "@/locales/de/common.json";

const messages: Record<string, Record<string, unknown>> = {
  en: enMessages as Record<string, unknown>,
  de: deMessages as Record<string, unknown>,
};

export function NextIntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <IntlProvider
      key={locale}
      locale={locale}
      messages={messages[locale] ?? messages.en}
    >
      {children}
    </IntlProvider>
  );
}
