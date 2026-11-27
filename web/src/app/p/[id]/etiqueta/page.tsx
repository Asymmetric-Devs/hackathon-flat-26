import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "@/components/panel/Actions";
import { Seal } from "@/components/Seal";
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
    color: { dark: "#1c1a16", light: "#00000000" },
  });

  return (
    <div className="wrap piece">
      <div className="no-print piece-head">
        <p className="label">Etiqueta para la pieza</p>
        <h1 className="subtitle">Imprimila y colgala o pegala en la pieza.</h1>
        <div className="btn-row">
          <PrintButton />
          <Link className="btn btn-ghost" href={`/p/${id}`}>
            Ver página pública
          </Link>
        </div>
      </div>

      <div className="label-sheet">
        <article className="tag">
          <div className="tag-qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="tag-body">
            <p className="tag-brand">Hilo</p>
            <p className="tag-kicker">Sello de origen</p>
            <p className="tag-title">{piece.meta.title}</p>
            {artisan ? <p className="tag-artisan">{artisan.meta.name}</p> : null}
            <p className="tag-number">{catalogNumber(id)}</p>
            <p className="tag-cta">Escaneá para comprobar quién la hizo</p>
          </div>
          <div className="tag-seal">
            <Seal number={id} size={64} />
          </div>
        </article>
        <p className="mono muted no-print" style={{ marginTop: "1rem" }}>
          {url}
        </p>
      </div>
    </div>
  );
}
