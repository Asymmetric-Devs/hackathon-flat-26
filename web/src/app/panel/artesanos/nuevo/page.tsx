import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArtisanForm } from "@/components/panel/ArtisanForm";
import { isAuthed } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Registrar artesano", robots: { index: false } };

export default async function NewArtisanPage() {
  if (!(await isAuthed())) redirect("/panel");
  const artisans = await store.listArtisans();

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">Panel · Artesanos</span>
        <h1 className="h1">Registrar artesano</h1>
        <p className="lead">
          Su ficha queda guardada y su huella firmada en Stellar. Si aprendió de alguien registrado, el vínculo
          también.
        </p>
      </header>
      <ArtisanForm artisans={artisans.map((a) => ({ id: a.record.id, name: a.meta.name, craft: a.meta.craft }))} />
    </div>
  );
}
