import { google } from "googleapis";
export type Row = Record<string, string>;
export const HEADERS: Record<string, string[]> = {
  Users: ["id","fullName","email","passwordHash","role","status","createdAt","updatedAt"],
  Registrations: ["id","fullName","email","phone","relationship","additionalGuests","totalRequested","guestNames","gift","dietary","requests","notes","status","approvedCount","registeredAt","reviewedBy","reviewedAt","adminNote"],
  Invitations: ["id","registrationId","accessCodeHash","token","accessCodeEnc","approvedCount","checkedInCount","remainingCount","status","issuedAt","revokedAt"],
  Checkins: ["id","invitationId","registrationId","admitted","securityId","timestamp","method","status","idempotencyKey"],
  Audit: ["id","userId","action","entityType","entityId","description","timestamp"],
  Settings: ["key","value","updatedAt"],
};
const auth = new google.auth.JWT({ email: process.env.GOOGLE_CLIENT_EMAIL, key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
const api = google.sheets({ version: "v4", auth });
const spreadsheetId = () => process.env.SPREADSHEET_ID!;
const toRow = (s: string, v: string[]): Row => Object.fromEntries(HEADERS[s].map((k, i) => [k, v[i] ?? ""]));
const toVals = (s: string, o: Row) => HEADERS[s].map((k) => o[k] ?? "");
export async function all(sheet: string): Promise<Row[]> {
  const r = await api.spreadsheets.values.get({ spreadsheetId: spreadsheetId(), range: `${sheet}!A2:Z` });
  return (r.data.values ?? []).map((v) => toRow(sheet, v as string[]));
}
export async function add(sheet: string, o: Row) {
  await api.spreadsheets.values.append({ spreadsheetId: spreadsheetId(), range: `${sheet}!A1`, valueInputOption: "RAW", insertDataOption: "INSERT_ROWS", requestBody: { values: [toVals(sheet, o)] } });
}
// Finds the row by ID at write time (never by cached row number), merges, writes.
export async function patch(sheet: string, id: string, p: Row): Promise<Row> {
  const ids = (await api.spreadsheets.values.get({ spreadsheetId: spreadsheetId(), range: `${sheet}!A:A` })).data.values ?? [];
  const idx = ids.findIndex((r) => r[0] === id) + 1;
  if (idx < 2) throw new Error(`${sheet}: ${id} not found`);
  const cur = (await api.spreadsheets.values.get({ spreadsheetId: spreadsheetId(), range: `${sheet}!A${idx}:Z${idx}` })).data.values?.[0] ?? [];
  const next = { ...toRow(sheet, cur as string[]), ...p };
  await api.spreadsheets.values.update({ spreadsheetId: spreadsheetId(), range: `${sheet}!A${idx}`, valueInputOption: "RAW", requestBody: { values: [toVals(sheet, next)] } });
  return next;
}
export async function initSheets() {
  const meta = await api.spreadsheets.get({ spreadsheetId: spreadsheetId() });
  const have = new Set(meta.data.sheets?.map((s) => s.properties?.title));
  const reqs = Object.keys(HEADERS).filter((s) => !have.has(s)).map((title) => ({ addSheet: { properties: { title } } }));
  if (reqs.length) await api.spreadsheets.batchUpdate({ spreadsheetId: spreadsheetId(), requestBody: { requests: reqs } });
  for (const s of Object.keys(HEADERS)) await api.spreadsheets.values.update({ spreadsheetId: spreadsheetId(), range: `${s}!A1`, valueInputOption: "RAW", requestBody: { values: [HEADERS[s]] } });
}
let cache: { at: number; v: Row } | null = null;
export async function settings(): Promise<Row> {
  if (cache && Date.now() - cache.at < 60_000) return cache.v;
  const v = Object.fromEntries((await all("Settings")).map((r) => [r.key, r.value]));
  cache = { at: Date.now(), v }; return v;
}
