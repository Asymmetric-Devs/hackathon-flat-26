import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { LogoMark } from "@/components/Logo";
import { PrintButton } from "@/components/panel/Actions";
import { config } from "@/lib/config";
import { catalogNumber } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.label.kicker, robots: { index: false } };
}

export default async function LabelPage({ params }: PageProps<"/p/[id]/etiqueta">) {
  const id = Number((await params).id);
  const piece = Number.isInteger(id) ? await store.getPiece(id) : null;
  if (!piece) notFound();
  const [{ lang, t }, artisan] = await Promise.all([getDict(), store.getArtisan(piece.meta.artisanId)]);

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
        <span className="kicker">
          {t.label.kicker} · {catalogNumber(id, lang)}
        </span>
        <h1 className="h1">{t.label.title}</h1>
        <p className="lead">{t.label.lead}</p>
        <div className="btn-row">
          <PrintButton />
          <Link className="btn btn-secondary" href={`/p/${id}`}>
            {t.label.seePublic}
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
            <span>{t.label.scan}</span>
            <strong>{catalogNumber(id, lang)}</strong>
          </div>
        </div>
      </article>
      <p className="mono faint no-print" style={{ marginTop: "1rem" }}>
        {url}
      </p>
    </div>
  );
}
