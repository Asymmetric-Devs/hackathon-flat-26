"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSubmit } from "./useSubmit";

type Option = { id: number; name: string; craft: string };
type Result = { id: number; txHash: string };

const MAX_SIDE = 1600;

/** Achica la foto a 1600 px de lado mayor en JPEG: la huella se calcula sobre estos bytes. */
async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("photo"))), "image/jpeg", 0.86),
  );
}

export function PieceForm({ artisans, preselected }: { artisans: Option[]; preselected?: number }) {
  const { t } = useI18n();
  const f = t.form;
  const { pending, error, submit } = useSubmit<Result>();
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [done, setDone] = useState<Result | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function onPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoError(null);
    if (!file) return;
    try {
      const blob = await prepare(file);
      setPhoto(blob);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setPhotoError(f.photoUnreadable);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setPhotoError(f.photoMissing);
      return;
    }
    const data = new FormData(event.currentTarget);
    data.set("photo", new File([photo], "pieza.jpg", { type: "image/jpeg" }));
    const result = await submit("/api/pieces", data);
    if (result) setDone(result);
  }

  if (done) {
    return (
      <div className="stack" style={{ ["--gap" as string]: "1.5rem" }}>
        <div className="notice notice-ok">
          <p>
            {f.issued[0]} <strong>{done.id}</strong> {f.issued[1]}{" "}
            <a href={`https://stellar.expert/explorer/testnet/tx/${done.txHash}`}>{f.issued[2]} ↗</a>
          </p>
        </div>
        <div className="btn-row">
          <Link className="btn btn-brand" href={`/p/${done.id}/etiqueta`}>
            {f.printLabel}
          </Link>
          <Link className="btn btn-secondary" href={`/p/${done.id}`}>
            {f.seePublic}
          </Link>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setDone(null);
              setPhoto(null);
              setPreview(null);
            }}
          >
            {f.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form card form-card" onSubmit={onSubmit}>
      <div className="field">
        <label className="label" htmlFor="artisanId">
          {f.artisan}
        </label>
        <select className="select" id="artisanId" name="artisanId" required defaultValue={preselected ?? ""}>
          <option value="" disabled>
            {f.pickArtisan}
          </option>
          {artisans.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.craft}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="label">{f.photo}</span>
        <label className="dropzone">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={f.photoPreview} />
          ) : (
            <span>{f.photoHint}</span>
          )}
          <input className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={onPhoto} />
        </label>
        {photoError ? <p className="notice">{photoError}</p> : null}
      </div>

      <div className="field">
        <label className="label" htmlFor="title">
          {f.title}
        </label>
        <input className="input" id="title" name="title" required maxLength={160} placeholder={f.titlePh} />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="technique">
            {f.technique}
          </label>
          <input className="input" id="technique" name="technique" required maxLength={200} placeholder={f.techniquePh} />
        </div>
        <div className="field">
          <label className="label" htmlFor="materials">
            {f.materials}
          </label>
          <input className="input" id="materials" name="materials" maxLength={300} placeholder={f.materialsPh} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="year">
            {f.year}
          </label>
          <input
            className="input"
            id="year"
            name="year"
            inputMode="numeric"
            pattern="\d{4}"
            defaultValue={new Date().getFullYear()}
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="story">
          {f.story}
        </label>
        <textarea className="textarea" id="story" name="story" maxLength={2000} placeholder={f.storyPh} />
      </div>

      {error ? <p className="notice">{error}</p> : null}
      <div className="btn-row">
        <button className="btn btn-brand" type="submit" disabled={pending}>
          {pending ? f.signing : f.issue}
        </button>
        <Link className="btn btn-secondary" href="/panel">
          {f.back}
        </Link>
      </div>
    </form>
  );
}
