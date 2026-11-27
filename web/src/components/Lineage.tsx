import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
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
export async function Lineage({ links, current }: { links: LineageLink[]; current?: number }) {
  const { t } = await getDict();
  const l = t.lineage;
  if (links.length <= 1) {
    return <p className="muted">{l.none}</p>;
  }

  return (
    <ol className="lineage">
      {links.map((link, index) => {
        const isCurrent = link.id !== null && link.id === current;
        const role = isCurrent ? l.artisan : index === 0 ? l.master : l.both;
        return (
          <li key={`${link.id ?? "ext"}-${index}`} className={isCurrent ? "lineage-item is-current" : "lineage-item"}>
            <span className="avatar">{initials(link.name)}</span>
            <div>
              <p className="lineage-name">
                {link.id && !isCurrent ? <Link href={`/a/${link.id}`}>{link.name}</Link> : link.name}
              </p>
              <p className="lineage-meta">
                {[role, link.craft, link.since ? `${l.since} ${link.since}` : null, link.onChain ? null : l.unregistered]
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
