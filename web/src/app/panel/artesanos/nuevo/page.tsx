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
    <div className="wrap piece">
      <header className="piece-head">
        <p className="label">Panel · Artesanos</p>
        <h1 className="title">Registrar artesano</h1>
        <p className="lede">
          Su ficha queda guardada y su huella firmada en Stellar. Si aprendió de alguien registrado, el vínculo
          también.
        </p>
      </header>
      <ArtisanForm artisans={artisans.map((a) => ({ id: a.record.id, name: a.meta.name, craft: a.meta.craft }))} />
    </div>
  );
}
