import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PieceForm } from "@/components/panel/PieceForm";
import { isAuthed } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Certificar pieza", robots: { index: false } };

export default async function NewPiecePage({ searchParams }: PageProps<"/panel/piezas/nueva">) {
  if (!(await isAuthed())) redirect("/panel");
  const artisans = await store.listArtisans();
  const raw = (await searchParams).artesano;
  const preselected = Number(Array.isArray(raw) ? raw[0] : raw) || undefined;

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">Panel · Certificados</span>
        <h1 className="h1">Certificar una pieza</h1>
        <p className="lead">
          La asociación firma en Stellar la huella de la foto y de la ficha. Después se imprime la etiqueta con el QR.
        </p>
      </header>
      {artisans.length === 0 ? (
        <p>
          Primero <Link href="/panel/artesanos/nuevo">registrá al artesano</Link>.
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
