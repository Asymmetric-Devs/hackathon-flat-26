"use client";

import Link from "next/link";
import { useState } from "react";
import { useSubmit } from "./useSubmit";

type Option = { id: number; name: string; craft: string };
type Result = { id: number; txHash: string };

export function ArtisanForm({ artisans }: { artisans: Option[] }) {
  const { pending, error, submit } = useSubmit<Result>();
  const [master, setMaster] = useState<string>("");
  const [done, setDone] = useState<(Result & { name: string }) | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (master && master !== "otro") data.set("masterId", master);
    const result = await submit("/api/artisans", data);
    if (result) {
      setDone({ ...result, name: String(data.get("name")) });
      form.reset();
      setMaster("");
    }
  }

  return (
    <div className="stack" style={{ ["--stack" as string]: "2rem" }}>
      {done ? (
        <div className="notice notice-ok">
          <p style={{ margin: 0 }}>
            <strong>{done.name}</strong> quedó registrado con el número {done.id}.{" "}
            <a href={`https://stellar.expert/explorer/testnet/tx/${done.txHash}`}>Ver la transacción ↗</a>
          </p>
          <p style={{ margin: "0.4rem 0 0" }}>
            <Link href={`/a/${done.id}`}>Ver su página</Link> ·{" "}
            <Link href={`/panel/piezas/nueva?artesano=${done.id}`}>Certificar una pieza suya</Link>
          </p>
        </div>
      ) : null}

      <form className="form" onSubmit={onSubmit}>
        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input className="input" id="name" name="name" required maxLength={120} />
          </div>
          <div className="field">
            <label className="label" htmlFor="craft">
              Oficio
            </label>
            <input className="input" id="craft" name="craft" required maxLength={120} placeholder="Telar, cerámica, platería…" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="stall">
              Puesto
            </label>
            <input className="input" id="stall" name="stall" maxLength={120} placeholder="Puesto 34, Plaza de las Artes" />
          </div>
          <div className="field">
            <label className="label" htmlFor="city">
              Ciudad
            </label>
            <input className="input" id="city" name="city" maxLength={120} placeholder="Mendoza, Corrientes…" />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="bio">
            Sobre su trabajo
          </label>
          <textarea className="textarea" id="bio" name="bio" maxLength={1200} />
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label" style={{ marginBottom: "0.45rem" }}>
            De quién aprendió el oficio
          </legend>
          <div className="field-row">
            <div className="field">
              <label className="visually-hidden" htmlFor="master">
                Maestro
              </label>
              <select className="select" id="master" value={master} onChange={(e) => setMaster(e.target.value)}>
                <option value="">Sin maestro / no sabe</option>
                {artisans.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.craft}
                  </option>
                ))}
                <option value="otro">Alguien que no está registrado…</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="since">
                Trabaja el oficio desde
              </label>
              <input className="input" id="since" name="since" inputMode="numeric" pattern="\d{4}" placeholder="Año" />
            </div>
          </div>
          {master === "otro" ? (
            <div className="field" style={{ marginTop: "1rem" }}>
              <label className="label" htmlFor="masterName">
                Nombre del maestro
              </label>
              <input className="input" id="masterName" name="masterName" maxLength={120} required />
            </div>
          ) : null}
          {master ? (
            <div className="field" style={{ marginTop: "1rem" }}>
              <label className="label" htmlFor="masterNote">
                Cómo aprendió
              </label>
              <input className="input" id="masterNote" name="masterNote" maxLength={600} placeholder="Era su abuela; le enseñó en el taller familiar" />
            </div>
          ) : null}
          <p className="field-hint" style={{ marginTop: "0.6rem" }}>
            Si el maestro está registrado, el vínculo queda firmado en Stellar.
          </p>
        </fieldset>

        {error ? <p className="notice">{error}</p> : null}
        <div className="btn-row">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Firmando en Stellar…" : "Registrar artesano"}
          </button>
          <Link className="btn btn-ghost" href="/panel">
            Volver
          </Link>
        </div>
      </form>
    </div>
  );
}
