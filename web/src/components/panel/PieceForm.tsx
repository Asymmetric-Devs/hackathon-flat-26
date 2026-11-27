"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la foto"))), "image/jpeg", 0.86),
  );
}

export function PieceForm({ artisans, preselected }: { artisans: Option[]; preselected?: number }) {
  const { pending, error, submit } = useSubmit<Result>();
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [done, setDone] = useState<Result | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function onPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoError(null);
    if (!file) return;
    try {
      const blob = await prepare(file);
      setPhoto(blob);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setPhotoError("No se pudo leer esa imagen. Probá con un JPG o PNG.");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setPhotoError("Falta la foto de la pieza.");
      return;
    }
    const data = new FormData(event.currentTarget);
    data.set("photo", new File([photo], "pieza.jpg", { type: "image/jpeg" }));
    const result = await submit("/api/pieces", data);
    if (result) setDone(result);
  }

  if (done) {
    return (
      <div className="stack" style={{ ["--stack" as string]: "1.5rem" }}>
        <div className="notice notice-ok">
          <p style={{ margin: 0 }}>
            Certificado número <strong>{done.id}</strong> emitido y firmado por la asociación.{" "}
            <a href={`https://stellar.expert/explorer/testnet/tx/${done.txHash}`}>Ver la transacción ↗</a>
          </p>
        </div>
        <div className="btn-row">
          <Link className="btn" href={`/p/${done.id}/etiqueta`}>
            Imprimir etiqueta con QR
          </Link>
          <Link className="btn btn-ghost" href={`/p/${done.id}`}>
            Ver página pública
          </Link>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setDone(null);
              setPhoto(null);
              setPreview(null);
            }}
          >
            Certificar otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label className="label" htmlFor="artisanId">
          Artesano
        </label>
        <select className="select" id="artisanId" name="artisanId" required defaultValue={preselected ?? ""}>
          <option value="" disabled>
            Elegí quién hizo la pieza
          </option>
          {artisans.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.craft}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="label">Foto de la pieza</span>
        <label className="dropzone">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa de la pieza" />
          ) : (
            <span className="muted">Elegí o sacá una foto. Se guarda tal cual: es la que verá quien compre.</span>
          )}
          <input className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={onPhoto} />
        </label>
        {photoError ? <p className="notice">{photoError}</p> : null}
      </div>

      <div className="field">
        <label className="label" htmlFor="title">
          Nombre de la pieza
        </label>
        <input className="input" id="title" name="title" required maxLength={160} placeholder="Poncho de telar criollo" />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="technique">
            Técnica
          </label>
          <input className="input" id="technique" name="technique" required maxLength={200} placeholder="Telar criollo de cuatro estacas" />
        </div>
        <div className="field">
          <label className="label" htmlFor="materials">
            Materiales
          </label>
          <input className="input" id="materials" name="materials" maxLength={300} placeholder="Lana de oveja hilada a mano" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="year">
            Año
          </label>
          <input className="input" id="year" name="year" inputMode="numeric" pattern="\d{4}" defaultValue={new Date().getFullYear()} />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="story">
          Historia de la pieza
        </label>
        <textarea className="textarea" id="story" name="story" maxLength={2000} placeholder="Teñida con jarilla y nogal. Llevó tres semanas de trabajo." />
      </div>

      {error ? <p className="notice">{error}</p> : null}
      <div className="btn-row">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Firmando en Stellar…" : "Emitir certificado"}
        </button>
        <Link className="btn btn-ghost" href="/panel">
          Volver
        </Link>
      </div>
    </form>
  );
}
