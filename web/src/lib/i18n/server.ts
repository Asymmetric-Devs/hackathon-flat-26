import "server-only";
import { cookies } from "next/headers";
import { dicts, type Lang } from "./dict";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get("lang")?.value;
  return value === "en" ? "en" : "es";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dicts[lang] };
}

export type Theme = "light" | "dark" | null;

export async function getTheme(): Promise<Theme> {
  const value = (await cookies()).get("theme")?.value;
  return value === "light" || value === "dark" ? value : null;
}
