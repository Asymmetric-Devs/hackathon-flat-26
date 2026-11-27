"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { LANGS } from "@/lib/i18n/dict";

const YEAR = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`;
}

/** Selector de idioma (ES / EN). */
export function LangSwitch() {
  const router = useRouter();
  const { lang, t } = useI18n();
  return (
    <div className="seg" role="group" aria-label={t.nav.lang}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === lang}
          onClick={() => {
            if (l === lang) return;
            setCookie("lang", l);
            document.documentElement.lang = l;
            router.refresh();
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Alterna modo claro y oscuro. Sin elección, sigue al sistema. */
export function ThemeSwitch() {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={t.nav.theme}
      title={t.nav.theme}
      onClick={() => {
        const root = document.documentElement;
        const current =
          root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        const next = current === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        setCookie("theme", next);
      }}
    >
      <svg className="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="i-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
      </svg>
    </button>
  );
}
