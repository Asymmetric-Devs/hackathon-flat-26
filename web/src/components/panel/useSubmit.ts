"use client";

import { useState } from "react";

type State = { pending: boolean; error: string | null };

/** Envía un FormData a la API y devuelve el JSON, con estado de carga y error. */
export function useSubmit<T>() {
  const [state, setState] = useState<State>({ pending: false, error: null });

  async function submit(url: string, body: FormData, method = "POST"): Promise<T | null> {
    setState({ pending: true, error: null });
    try {
      const response = await fetch(url, { method, body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState({ pending: false, error: data.error ?? "Algo salió mal. Probá de nuevo." });
        return null;
      }
      setState({ pending: false, error: null });
      return data as T;
    } catch {
      setState({ pending: false, error: "No hay conexión con el servidor." });
      return null;
    }
  }

  return { ...state, submit };
}
