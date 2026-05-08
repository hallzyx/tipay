/**
 * React context for i18n — provides `t()` helper and locale toggle.
 * @module contexts/language
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  type Locale,
  getSavedLocale,
  saveLocale,
  t as translate,
} from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  /** Translate a single key. */
  t: (key: string) => string;
  /** Translate with replacements: t("hello {name}", { name: "John" }). */
  tx: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  t: (k) => k,
  tx: (k) => k,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "en" during SSR to avoid hydration mismatch.
  // The correct locale is detected client-side via useEffect below.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  // Detect saved / browser locale on mount (client-only)
  useEffect(() => {
    setLocaleState(getSavedLocale());
    setHydrated(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    saveLocale(l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "en" ? "es" : "en";
      saveLocale(next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale],
  );

  const tx = useCallback(
    (
      key: string,
      params?: Record<string, string | number>,
    ) => {
      let str = translate(key, locale);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale],
  );

  // Suppress hydration warnings during the initial client render
  // while the detected locale differs from SSR default.
  if (typeof window === "undefined" || !hydrated) {
    // Render with default locale to match SSR output
    const tHydrate = (key: string) => translate(key, "en");
    const txHydrate = (key: string, params?: Record<string, string | number>) => {
      let str = translate(key, "en");
      if (params) {
        for (const [k, v] of Object.entries(params ?? {})) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    };
    return (
      <LanguageContext.Provider
        value={{ locale: "en", t: tHydrate, tx: txHydrate, setLocale, toggleLocale }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{ locale, t, tx, setLocale, toggleLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}
