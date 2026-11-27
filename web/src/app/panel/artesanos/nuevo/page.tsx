import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArtisanForm } from "@/components/panel/ArtisanForm";
import { isAuthed } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.panel.register, robots: { index: false } };
}

export default async function NewArtisanPage() {
  if (!(await isAuthed())) redirect("/panel");
  const [{ t }, artisans] = await Promise.all([getDict(), store.listArtisans()]);

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">{t.panel.newArtisanKicker}</span>
        <h1 className="h1">{t.panel.register}</h1>
        <p className="lead">
          {t.panel.newArtisanLead}
        </p>
      </header>
      <ArtisanForm artisans={artisans.map((a) => ({ id: a.record.id, name: a.meta.name, craft: a.meta.craft }))} />
    </div>
  );
}
