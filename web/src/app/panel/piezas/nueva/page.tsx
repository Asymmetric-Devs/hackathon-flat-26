import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PieceForm } from "@/components/panel/PieceForm";
import { isAuthed } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.panel.newPieceTitle, robots: { index: false } };
}

export default async function NewPiecePage({ searchParams }: PageProps<"/panel/piezas/nueva">) {
  if (!(await isAuthed())) redirect("/panel");
  const [{ t }, artisans] = await Promise.all([getDict(), store.listArtisans()]);
  const raw = (await searchParams).artesano;
  const preselected = Number(Array.isArray(raw) ? raw[0] : raw) || undefined;

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">{t.panel.newPieceKicker}</span>
        <h1 className="h1">{t.panel.newPieceTitle}</h1>
        <p className="lead">
          {t.panel.newPieceLead}
        </p>
      </header>
      {artisans.length === 0 ? (
        <p>
          {t.panel.registerFirst[0]} <Link href="/panel/artesanos/nuevo">{t.panel.registerFirst[1]}</Link>.
        </p>
      ) : (
        <PieceForm
          artisans={artisans.map((a) => ({ id: a.record.id, name: a.meta.name, craft: a.meta.craft }))}
          preselected={preselected}
        />
      )}
    </div>
  );
}
