import Link from "next/link";
import type { LineageLink } from "@/lib/verify";

/** Línea del oficio: del maestro más antiguo al artesano, como un hilo vertical. */
export function Lineage({ links, current }: { links: LineageLink[]; current?: number }) {
  if (links.length <= 1 && !links[0]?.id) {
    return <p className="muted">Sin maestro registrado.</p>;
  }

  return (
    <ol className="lineage">
      {links.map((link, index) => {
        const isCurrent = link.id !== null && link.id === current;
        const name = link.id && !isCurrent ? <Link href={`/a/${link.id}`}>{link.name}</Link> : link.name;
        return (
          <li key={`${link.id ?? "ext"}-${index}`} className={isCurrent ? "lineage-item is-current" : "lineage-item"}>
            <span className="lineage-knot" aria-hidden="true" />
            <div>
              <p className="lineage-name">{name}</p>
              <p className="label">
                {[
                  index === 0 && links.length > 1 ? "Maestro" : isCurrent ? "Artesano" : "Aprendiz y maestro",
                  link.craft,
                  link.since ? `desde ${link.since}` : null,
                  link.onChain ? null : "no registrado",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
