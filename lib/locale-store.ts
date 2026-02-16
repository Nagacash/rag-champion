import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "de";

type LocaleStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "first-family-locale" }
  )
);
