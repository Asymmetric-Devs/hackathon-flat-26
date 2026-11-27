"use client";

import { createContext, useContext } from "react";
import { dicts, type Dict, type Lang } from "./dict";

const I18nContext = createContext<{ lang: Lang; t: Dict }>({ lang: "es", t: dicts.es });

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ lang, t: dicts[lang] }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
