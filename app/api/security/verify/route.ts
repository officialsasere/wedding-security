import { handle, need } from "@/lib/auth"; import { lookup } from "@/lib/lookup";
export const POST = (req: Request) => handle(async () => { await need("security", "admin"); return lookup(await req.json()); });
