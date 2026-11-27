const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Argentina/Mendoza",
});

export function formatDate(input: Date | string | number) {
  const date = typeof input === "number" ? new Date(input * 1000) : new Date(input);
  return dateFmt.format(date);
}

export function catalogNumber(id: number) {
  return `N.º ${String(id).padStart(4, "0")}`;
}

export function shortHash(hash: string, size = 8) {
  return hash.length <= size * 2 ? hash : `${hash.slice(0, size)}…${hash.slice(-size)}`;
}
