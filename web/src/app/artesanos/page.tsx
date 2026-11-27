import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artesanos" };

export default async function ArtisansPage() {
  const [artisans, pieces] = await Promise.all([store.listArtisans(), store.listPieces()]);
  const counts = new Map<number, number>();
  for (const p of pieces) counts.set(p.meta.artisanId, (counts.get(p.meta.artisanId) ?? 0) + 1);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));

  return (
    <div className="wrap piece">
      <header className="piece-head">
        <p className="label">Registro</p>
        <h1 className="title">Artesanos</h1>
        <p className="lede">Registrados por la asociación, con el maestro de quien aprendieron el oficio.</p>
      </header>
      {artisans.length === 0 ? (
        <p className="muted">Todavía no hay artesanos registrados.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Artesano</th>
                <th>Oficio</th>
                <th>Aprendió de</th>
                <th>Piezas</th>
              </tr>
            </thead>
            <tbody>
              {artisans.map((a) => {
                const from = a.meta.learnedFrom;
                const masterName = from?.artisanId ? names.get(from.artisanId) : from?.name;
                return (
                  <tr key={a.record.id}>
                    <td>
                      <Link href={`/a/${a.record.id}`}>{a.meta.name}</Link>
                    </td>
                    <td>{a.meta.craft}</td>
                    <td>
                      {from?.artisanId ? (
                        <Link href={`/a/${from.artisanId}`}>{masterName}</Link>
                      ) : (
                        (masterName ?? "—")
                      )}
                    </td>
                    <td className="catalog">{counts.get(a.record.id) ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
