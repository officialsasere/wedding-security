import { all } from "./sheets"; import { hashCode } from "./util";
export async function lookup(input: { token?: string; code?: string }) {
  const invs = await all("Invitations");
  const inv = input.token ? invs.find((i) => i.token === input.token) : input.code ? invs.find((i) => i.accessCodeHash === hashCode(String(input.code))) : undefined;
  if (!inv) return { state: "invalid" };
  const reg = (await all("Registrations")).find((r) => r.id === inv.registrationId);
  const approved = Number(inv.approvedCount), used = Number(inv.checkedInCount);
  const state = inv.status === "Revoked" ? "revoked" : reg?.status === "Rejected" ? "rejected" : reg?.status !== "Approved" ? "invalid" : used >= approved ? "full" : used > 0 ? "partial" : "valid";
  return { state, invitationId: inv.id, guest: reg?.fullName, relationship: reg?.relationship, approved, used, remaining: approved - used, guestNames: reg?.guestNames };
}
