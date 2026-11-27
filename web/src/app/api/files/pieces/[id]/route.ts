import { store } from "@/lib/store";

export async function GET(_request: Request, { params }: RouteContext<"/api/files/pieces/[id]">) {
  const id = Number((await params).id);
  const photo = Number.isInteger(id) ? await store.getPhoto(id) : null;
  if (!photo) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(photo.bytes), {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
