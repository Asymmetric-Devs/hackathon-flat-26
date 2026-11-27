"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "./useSubmit";

export function LoginForm() {
  const router = useRouter();
  const { pending, error, submit } = useSubmit<{ ok: true }>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await submit("/api/session", new FormData(event.currentTarget))) router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error ? <p className="notice">{error}</p> : null}
      <div>
        <button className="btn btn-brand" style={{ width: "100%" }} type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </form>
  );
}
