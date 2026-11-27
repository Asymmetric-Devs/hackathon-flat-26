import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.artisans.title };
}

export default async function ArtisansPage() {
  const [{ t }, artisans, pieces] = await Promise.all([getDict(), store.listArtisans(), store.listPieces()]);
  const c = t.artisans.cols;
  const counts = new Map<number, number>();
  for (const p of pieces) counts.set(p.meta.artisanId, (counts.get(p.meta.artisanId) ?? 0) + 1);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">{t.artisans.kicker}</span>
        <h1 className="h1">{t.artisans.title}</h1>
        <p className="lead">{t.artisans.lead}</p>
      </header>
      {artisans.length === 0 ? (
        <div className="empty">{t.artisans.empty}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{c[0]}</th>
                <th>{c[1]}</th>
                <th>{c[2]}</th>
                <th>{c[3]}</th>
                <th style={{ textAlign: "right" }}>{c[4]}</th>
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
                    <td className="muted">{a.meta.city || "—"}</td>
                    <td>
                      {from?.artisanId ? (
                        <Link href={`/a/${from.artisanId}`}>{masterName}</Link>
                      ) : (
                        <span className="muted">{masterName || "—"}</span>
                      )}
                    </td>
                    <td className="num" style={{ textAlign: "right" }}>
                      {counts.get(a.record.id) ?? 0}
                    </td>
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
