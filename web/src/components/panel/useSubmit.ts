"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type State = { pending: boolean; error: string | null };

/** Envía un FormData a la API y devuelve el JSON, con estado de carga y error. */
export function useSubmit<T>() {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ pending: false, error: null });

  async function submit(url: string, body: FormData, method = "POST"): Promise<T | null> {
    setState({ pending: true, error: null });
    try {
      const response = await fetch(url, { method, body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState({ pending: false, error: data.error ?? t.form.genericError });
        return null;
      }
      setState({ pending: false, error: null });
      return data as T;
    } catch {
      setState({ pending: false, error: t.form.noServer });
      return null;
    }
  }

  return { ...state, submit };
}
