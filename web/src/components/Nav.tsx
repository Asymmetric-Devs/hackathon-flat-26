"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/piezas", label: "Piezas" },
  { href: "/artesanos", label: "Artesanos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/panel", label: "Asociación" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Principal">
      {links.map((link) => {
        const active = !link.href.includes("#") && pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
