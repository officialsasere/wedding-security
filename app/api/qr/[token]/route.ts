import { all } from "@/lib/sheets"; import { qrPng } from "@/lib/invites";
export async function GET(_: Request, { params }: { params: { token: string } }) {
  const inv = (await all("Invitations")).find((i) => i.token === params.token);
  if (!inv) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(await qrPng(inv.token)), { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600" } });
}
