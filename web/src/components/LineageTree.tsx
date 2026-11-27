"use client";

import { useEffect, useRef, useState } from "react";

type Node = { id: string; x: number; y: number; name: string; meta: string; current?: boolean };

const nodes: Node[] = [
  { id: "a", x: 230, y: 30, name: "Doña Ramona", meta: "Telar · desde 1958", current: false },
  { id: "b", x: 100, y: 150, name: "Rosa", meta: "Telar · desde 1984" },
  { id: "c", x: 360, y: 150, name: "Elba", meta: "Telar y teñido · 1990" },
  { id: "d", x: 40, y: 270, name: "Marina", meta: "Telar · 2009", current: true },
  { id: "e", x: 200, y: 270, name: "Julián", meta: "Telar · 2015" },
  { id: "f", x: 360, y: 270, name: "Ana", meta: "Teñido natural · 2018" },
];

const edges: [string, string][] = [
  ["a", "b"],
  ["a", "c"],
  ["b", "d"],
  ["b", "e"],
  ["c", "f"],
];

const W = 148;
const H = 52;

/** Árbol del oficio: maestros y aprendices unidos por costuras que se dibujan. */
export function LineageTree() {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      ref={ref}
      className={on ? "tree tree-anim" : "tree"}
      viewBox="0 0 560 340"
      role="img"
      aria-label="Ejemplo de línea del oficio: una maestra tejedora, sus aprendices y los aprendices de ellas"
    >
      {edges.map(([from, to], i) => {
        const a = byId[from];
        const b = byId[to];
        const x1 = a.x + W / 2;
        const y1 = a.y + H;
        const x2 = b.x + W / 2;
        const y2 = b.y;
        const mid = (y1 + y2) / 2;
        return (
          <path
            key={`${from}-${to}`}
            className="tree-edge"
            d={`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`}
            style={{ animationDelay: `${i * 180}ms`, opacity: on ? 1 : 0 }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <g
          key={n.id}
          className={n.current ? "tree-node is-current" : "tree-node"}
          style={{
            opacity: on ? 1 : 0,
            transform: on ? "none" : "translateY(8px)",
            transition: `opacity .6s ${i * 120}ms, transform .6s ${i * 120}ms`,
          }}
        >
          <rect x={n.x} y={n.y} width={W} height={H} rx="12" />
          <text className="tree-name" x={n.x + 14} y={n.y + 22}>
            {n.name}
          </text>
          <text className="tree-meta" x={n.x + 14} y={n.y + 39}>
            {n.meta}
          </text>
        </g>
      ))}
    </svg>
  );
}
