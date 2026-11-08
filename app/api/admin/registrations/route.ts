import { all } from "@/lib/sheets"; import { handle, need } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const GET = () => handle(async () => {
  await need("admin");
  const [regs, invs, checks, users] = await Promise.all([all("Registrations"), all("Invitations"), all("Checkins"), all("Users")]);
  const n = (s: string) => Number(s) || 0; const ok = checks.filter((c) => c.status === "Success");
  const expected = invs.filter((i) => i.status !== "Revoked").reduce((a, i) => a + n(i.approvedCount), 0); const inside = ok.reduce((a, c) => a + n(c.admitted), 0);
  const stats = { total: regs.length, pending: regs.filter((r) => r.status === "Pending Approval").length, approved: regs.filter((r) => r.status === "Approved").length, rejected: regs.filter((r) => r.status === "Rejected").length, issued: invs.length, revoked: invs.filter((i) => i.status === "Revoked").length, expected, inside, remaining: expected - inside, pct: expected ? Math.round((inside / expected) * 100) : 0 };
  const byOfficer = users.filter((u) => u.role === "security").map((u) => ({ name: u.fullName, admitted: ok.filter((c) => c.securityId === u.id).reduce((a, c) => a + n(c.admitted), 0) }));
  return { stats, byOfficer, registrations: regs.reverse() };
});
