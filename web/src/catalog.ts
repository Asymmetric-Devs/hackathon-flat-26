/**
 * Catálogo de demostración: obras de dominio público (fuente: Wikimedia Commons).
 * En la cadena cada obra guarda un `meta`: un slug de este catálogo o un JSON con sus datos.
 * Los epígrafes son de Muro; fecha, técnica y colección deben contrastarse antes de usarse fuera de la demo.
 */
export type Piece = {
  slug: string; title: string; artist: string; year: string; medium: string; collection: string;
  /** alto / ancho de la imagen */ ratio: number; epigraph: string; source: string;
};
export const CATALOG: Piece[] = [
  { slug: "manet-bar", title: "Un bar aux Folies-Bergère", artist: "Édouard Manet", year: "1882", medium: "óleo sobre lienzo", collection: "The Courtauld, Londres", ratio: 1045 / 1400,
    epigraph: "Una camarera mira de frente a quien entra al bar. El espejo, detrás, muestra todo lo que el cuadro no deja ver.",
    source: "https://commons.wikimedia.org/wiki/File:Edouard_Manet,_A_Bar_at_the_Folies-Bergère.jpg" },
  { slug: "candido-curupayti", title: "Después de la batalla de Curupaytí", artist: "Cándido López", year: "1893", medium: "óleo sobre tela", collection: "MNBA, Buenos Aires", ratio: 460 / 1400,
    epigraph: "López perdió el brazo derecho en la guerra y aprendió a pintar con la izquierda. Pintó el campo de batalla de memoria, soldado por soldado.",
    source: "https://commons.wikimedia.org/wiki/File:Cándido_Lopez_-_Después_de_la_Batalla_de_Curupaytí_-_Google_Art_Project.jpg" },
  { slug: "fader-mantones", title: "Los mantones de Manila", artist: "Fernando Fader", year: "1914", medium: "óleo sobre tela", collection: "MNBA, Buenos Aires", ratio: 1145 / 1400,
    epigraph: "Seda, color y luz de interior. Fader pintando una tarde que nadie quería que terminara.",
    source: "https://commons.wikimedia.org/wiki/File:Fernando_Fader_-_Los_mantones_de_Manila_-_Google_Art_Project.jpg" },
  { slug: "pueyrredon-alto", title: "Un alto en el campo", artist: "Prilidiano Pueyrredón", year: "1861", medium: "óleo sobre tela", collection: "MNBA, Buenos Aires", ratio: 624 / 1400,
    epigraph: "Carretas detenidas, nadie apurado. Pueyrredón frenó la pampa en 1861 para que alguien la mirara.",
    source: "https://commons.wikimedia.org/wiki/File:Prilidiano_Pueyrredon_-_Un_alto_en_el_campo_-_Google_Art_Project.jpg" },
  { slug: "afklint-retablo", title: "Retablo n.º 1, Grupo X", artist: "Hilma af Klint", year: "1915", medium: "óleo y hoja de metal sobre tela", collection: "Fundación Hilma af Klint, Estocolmo", ratio: 1400 / 1055,
    epigraph: "Pintó abstracción antes que casi nadie y pidió que no se mostrara hasta veinte años después de su muerte. La obra esperó.",
    source: "https://commons.wikimedia.org/wiki/File:Hilma_af_Klint_-_Altarpiece_No._1_Group_X_(13919).jpg" },
  { slug: "vangogh-terraza", title: "Terraza de café por la noche", artist: "Vincent van Gogh", year: "1888", medium: "óleo sobre tela", collection: "Kröller-Müller, Otterlo", ratio: 1400 / 1094,
    epigraph: "Una terraza de Arles iluminada a gas, pintada en septiembre. Un bar, de noche, con las luces prendidas para nadie en particular.",
    source: "https://commons.wikimedia.org/wiki/File:Vincent-van-gogh-cafe-terrace-on-the-place-du-forum-arles-at-night-the.jpg" },
  { slug: "rousseau-sueno", title: "El sueño", artist: "Henri Rousseau", year: "1910", medium: "óleo sobre tela", collection: "MoMA, Nueva York", ratio: 953 / 1400,
    epigraph: "Rousseau pintó selvas que nunca vio. Alcanza con un cuadro para que una pared deje de ser una pared.",
    source: "https://commons.wikimedia.org/wiki/File:Henri_Rousseau_-_Le_Rêve_-_Google_Art_Project.jpg" },
];
export const bySlug = (s: string) => CATALOG.find((p) => p.slug === s);

export type Meta = Omit<Piece, "slug" | "epigraph" | "source"> & { img: string; epigraph?: string };
export type Resolved = { title: string; artist: string; year: string; medium: string; collection: string; img: string; ratio: number; epigraph: string; demo: boolean };

/** Resuelve el `meta` guardado en la cadena: slug del catálogo o JSON con los datos de una obra propia. */
export function resolve(meta: string): Resolved {
  const p = bySlug(meta);
  if (p) return { ...p, img: `/obras/${p.slug}.jpg`, demo: true };
  try {
    const j = JSON.parse(meta) as Partial<Meta>;
    return { title: j.title ?? "Sin título", artist: j.artist ?? "Artista", year: j.year ?? "", medium: j.medium ?? "", collection: j.collection ?? "",
      img: j.img ?? "", ratio: j.ratio ?? 1.2, epigraph: j.epigraph ?? "", demo: false };
  } catch {
    return { title: meta || "Sin título", artist: "Artista", year: "", medium: "", collection: "", img: "", ratio: 1.2, epigraph: "", demo: false };
  }
}
