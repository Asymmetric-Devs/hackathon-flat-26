import type { Lang } from "./i18n/dict";

const formats: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }),
  en: new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }),
};

export function formatDate(input: Date | string | number, lang: Lang = "es") {
  const date = typeof input === "number" ? new Date(input * 1000) : new Date(input);
  return formats[lang].format(date);
}

export function catalogNumber(id: number, lang: Lang = "es") {
  return `${lang === "en" ? "No." : "N.º"} ${String(id).padStart(4, "0")}`;
}

export function shortHash(hash: string, size = 8) {
  return hash.length <= size * 2 ? hash : `${hash.slice(0, size)}…${hash.slice(-size)}`;
}
