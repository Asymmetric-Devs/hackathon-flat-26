"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSubmit } from "./useSubmit";

type Option = { id: number; name: string; craft: string };
type Result = { id: number; txHash: string };

export function ArtisanForm({ artisans }: { artisans: Option[] }) {
  const { t } = useI18n();
  const f = t.form;
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
    <div className="stack" style={{ ["--gap" as string]: "1.5rem" }}>
      {done ? (
        <div className="notice notice-ok">
          <p>
            <strong>{done.name}</strong> {f.registered[0]} {done.id}.{" "}
            <a href={`https://stellar.expert/explorer/testnet/tx/${done.txHash}`}>{f.registered[1]} ↗</a>
          </p>
          <p style={{ marginTop: "0.4rem" }}>
            <Link href={`/a/${done.id}`}>{f.registered[2]}</Link> ·{" "}
            <Link href={`/panel/piezas/nueva?artesano=${done.id}`}>{f.registered[3]}</Link>
          </p>
        </div>
      ) : null}

      <form className="form card form-card" onSubmit={onSubmit}>
        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="name">
              {f.name}
            </label>
            <input className="input" id="name" name="name" required maxLength={120} />
          </div>
          <div className="field">
            <label className="label" htmlFor="craft">
              {f.craft}
            </label>
            <input className="input" id="craft" name="craft" required maxLength={120} placeholder={f.craftPh} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="stall">
              {f.stall}
            </label>
            <input className="input" id="stall" name="stall" maxLength={120} placeholder={f.stallPh} />
          </div>
          <div className="field">
            <label className="label" htmlFor="city">
              {f.city}
            </label>
            <input className="input" id="city" name="city" maxLength={120} placeholder={f.cityPh} />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="bio">
            {f.bio}
          </label>
          <textarea className="textarea" id="bio" name="bio" maxLength={1200} />
        </div>

        <fieldset className="fieldset">
          <legend className="label" style={{ marginBottom: "0.5rem" }}>
            {f.learnedFrom}
          </legend>
          <div className="field-row">
            <div className="field">
              <label className="visually-hidden" htmlFor="master">
                {f.master}
              </label>
              <select className="select" id="master" value={master} onChange={(e) => setMaster(e.target.value)}>
                <option value="">{f.noMaster}</option>
                {artisans.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.craft}
                  </option>
                ))}
                <option value="otro">{f.otherMaster}</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="since">
                {f.since}
              </label>
              <input className="input" id="since" name="since" inputMode="numeric" pattern="\d{4}" placeholder={f.year} />
            </div>
          </div>
          {master === "otro" ? (
            <div className="field">
              <label className="label" htmlFor="masterName">
                {f.masterName}
              </label>
              <input className="input" id="masterName" name="masterName" maxLength={120} required />
            </div>
          ) : null}
          {master ? (
            <div className="field">
              <label className="label" htmlFor="masterNote">
                {f.howLearned}
              </label>
              <input className="input" id="masterNote" name="masterNote" maxLength={600} placeholder={f.howLearnedPh} />
            </div>
          ) : null}
          <p className="field-hint">{f.linkHint}</p>
        </fieldset>

        {error ? <p className="notice">{error}</p> : null}
        <div className="btn-row">
          <button className="btn btn-brand" type="submit" disabled={pending}>
            {pending ? f.signing : f.registerSubmit}
          </button>
          <Link className="btn btn-secondary" href="/panel">
            {f.back}
          </Link>
        </div>
      </form>
    </div>
  );
}
