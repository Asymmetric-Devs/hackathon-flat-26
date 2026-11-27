import Link from "next/link";
import type { LineageLink } from "@/lib/verify";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** Línea del oficio: del maestro más antiguo al artesano. */
export function Lineage({ links, current }: { links: LineageLink[]; current?: number }) {
  if (links.length <= 1) {
    return <p className="muted">No tiene un maestro registrado.</p>;
  }

  return (
    <ol className="lineage">
      {links.map((link, index) => {
        const isCurrent = link.id !== null && link.id === current;
        const role = isCurrent ? "Artesano" : index === 0 ? "Maestro" : "Aprendiz y maestro";
        return (
          <li key={`${link.id ?? "ext"}-${index}`} className={isCurrent ? "lineage-item is-current" : "lineage-item"}>
            <span className="avatar">{initials(link.name)}</span>
            <div>
              <p className="lineage-name">
                {link.id && !isCurrent ? <Link href={`/a/${link.id}`}>{link.name}</Link> : link.name}
              </p>
              <p className="lineage-meta">
                {[role, link.craft, link.since ? `desde ${link.since}` : null, link.onChain ? null : "no registrado"]
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
