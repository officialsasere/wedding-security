type P = Record<string, string>;
const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const wrap = (inner: string, p: P) => `<div style="background:#F5F0F3;padding:24px 12px;font-family:Georgia,serif;color:#3B1F36"><table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:3px double #B08D57;border-radius:12px"><tr><td style="padding:32px 28px;text-align:center">
<p style="margin:0;font-size:13px;letter-spacing:2px;color:#B08D57">TOGETHER WITH THEIR FAMILIES</p><h1 style="margin:8px 0 20px;font-size:30px;font-weight:normal">${esc(p.couple_names)}</h1>${inner}
<p style="margin:24px 0 0;font-size:14px;line-height:1.6">${esc(p.wedding_date)} ${esc(p.wedding_time)}<br>${esc(p.venue)}</p></td></tr></table></div>`;
const hi = (p: P) => `<p style="font-size:18px">Dear ${esc(p.guest_name)},</p>`;
export function buildEmail(type: string, p: P): { subject: string; html: string } {
  const ref = `<p style="font-size:14px">Reference: <b>${esc(p.registration_id)}</b></p>`;
  if (type === "confirm") return { subject: "We received your registration", html: wrap(`${hi(p)}<p style="line-height:1.6">Thank you for registering. Your request is awaiting approval. We will email your invitation once it is approved.</p>${ref}`, p) };
  if (type === "rejected") return { subject: "About your registration", html: wrap(`${hi(p)}<p style="line-height:1.6">Thank you for your interest. Sadly we are unable to accommodate this registration.${p.reason ? ` ${esc(p.reason)}` : ""}</p>${ref}`, p) };
  if (type === "revoked") return { subject: "Your invitation has been withdrawn", html: wrap(`${hi(p)}<p style="line-height:1.6">Your invitation is no longer valid. Please contact the couple if you think this is a mistake.</p>${ref}`, p) };
  return { subject: "Your wedding invitation", html: wrap(`${hi(p)}<p style="line-height:1.6">You are invited. Your invitation admits up to <b>${esc(p.approved_guest_count)}</b>.</p>
<img src="${esc(p.qr_code_url)}" width="200" height="200" alt="Entry QR code" style="display:block;margin:16px auto">
<p style="font-size:13px;margin:0">Access code</p><p style="font-size:28px;letter-spacing:4px;margin:4px 0;font-family:monospace">${esc(p.access_code)}</p>${ref}
<p style="font-size:14px;line-height:1.6">Show the QR code or give this code to security at the entrance.</p><p><a href="${esc(p.invitation_url)}" style="display:inline-block;background:#3B1F36;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">Open my invitation</a></p>`, p) };
}
