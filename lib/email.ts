import { audit } from "./audit"; import { buildEmail } from "./emailTemplates";
export async function sendEmail(type: "confirm" | "approved" | "rejected" | "revoked", to: string, params: Record<string, string>, regId: string) {
  const { subject, html } = buildEmail(type, params);
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service_id: process.env.EMAILJS_SERVICE_ID, template_id: process.env.EMAILJS_TEMPLATE_ID, user_id: process.env.EMAILJS_PUBLIC_KEY, accessToken: process.env.EMAILJS_PRIVATE_KEY, template_params: { to_email: to, subject, html_body: html } }) });
  const ok = res.ok;
  await audit("system", ok ? "email_sent" : "email_failed", "registration", regId, `${type} -> ${to}${ok ? "" : ": " + (await res.text()).slice(0, 200)}`);
  return ok;
}
