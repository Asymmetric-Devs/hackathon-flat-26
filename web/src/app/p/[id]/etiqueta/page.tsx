import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { LogoMark } from "@/components/Logo";
import { PrintButton } from "@/components/panel/Actions";
import { config } from "@/lib/config";
import { catalogNumber } from "@/lib/format";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Etiqueta", robots: { index: false } };

export default async function LabelPage({ params }: PageProps<"/p/[id]/etiqueta">) {
  const id = Number((await params).id);
  const piece = Number.isInteger(id) ? await store.getPiece(id) : null;
  if (!piece) notFound();
  const artisan = await store.getArtisan(piece.meta.artisanId);

  const url = `${config.publicBaseUrl}/p/${id}`;
  const qr = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#18150f", light: "#00000000" },
  });

  return (
    <div className="wrap page">
      <header className="page-head no-print">
        <span className="kicker">Etiqueta · {catalogNumber(id)}</span>
        <h1 className="h1">Imprimila y colgala en la pieza</h1>
        <p className="lead">Quien la escanee llega a la página de verificación de esta pieza.</p>
        <div className="btn-row">
          <PrintButton />
          <Link className="btn btn-secondary" href={`/p/${id}`}>
            Ver página pública
          </Link>
        </div>
      </header>

      <article className="tag">
        <div className="tag-qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <div>
          <p className="tag-brand">
            <LogoMark size={16} /> oficio
          </p>
          <p className="tag-title">{piece.meta.title}</p>
          {artisan ? <p className="tag-artisan">{artisan.meta.name}</p> : null}
          <div className="tag-foot">
            <span>Escaneá y comprobá su origen</span>
            <strong>{catalogNumber(id)}</strong>
          </div>
        </div>
      </article>
      <p className="mono faint no-print" style={{ marginTop: "1rem" }}>
        {url}
      </p>
    </div>
  );
}
