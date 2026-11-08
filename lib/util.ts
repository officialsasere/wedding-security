import { createHash, createCipheriv, createDecipheriv, randomBytes, randomInt } from "crypto";
export const uid = (p: string) => `${p}_${randomBytes(6).toString("hex")}`;
export const now = () => new Date().toISOString();
const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const genCode = () => Array.from({ length: 8 }, () => A[randomInt(A.length)]).join("");
export const genToken = () => randomBytes(24).toString("base64url");
export const hashCode = (c: string) => createHash("sha256").update(c.trim().toUpperCase().replace(/-/g, "") + process.env.CODE_PEPPER).digest("hex");
const key = () => Buffer.from(process.env.ENC_KEY!, "hex");
export function enc(t: string) { const iv = randomBytes(12); const c = createCipheriv("aes-256-gcm", key(), iv); const d = Buffer.concat([c.update(t, "utf8"), c.final()]); return [iv, c.getAuthTag(), d].map((b) => b.toString("base64")).join("."); }
export function dec(s: string) { const [iv, tag, d] = s.split(".").map((x) => Buffer.from(x, "base64")); const c = createDecipheriv("aes-256-gcm", key(), iv); c.setAuthTag(tag); return Buffer.concat([c.update(d), c.final()]).toString("utf8"); }
// serialises async work in this process (use a single server instance for the event)
let chain: Promise<unknown> = Promise.resolve();
export function locked<T>(fn: () => Promise<T>): Promise<T> { const r = chain.then(fn, fn); chain = r.catch(() => {}); return r; }
const hits = new Map<string, number[]>();
export function limited(k: string, max = 10, win = 60_000) { const t = Date.now(); const a = (hits.get(k) ?? []).filter((x) => t - x < win); a.push(t); hits.set(k, a); return a.length > max; }
