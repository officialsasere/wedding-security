# Wedding Guest Access (Next.js + Google Sheets + EmailJS)

## Run it
1. `npm install`
2. Google Cloud: enable **Sheets API**, create a **Service Account**, download its JSON key. Create a blank Google Sheet and **share it (Editor) with the service account email**. Copy the sheet ID from its URL.
3. `cp .env.example .env.local` (also copy to `.env` for the setup script) and fill in everything. Generate `ENC_KEY` with `openssl rand -hex 32`.
4. `npm run setup` — creates the tabs, headers, first admin (ADMIN_EMAIL/ADMIN_PASSWORD) and default Settings.
5. `npm run dev` → http://localhost:3000. Staff sign in at `/login`.

## EmailJS (one template, created once)
All email designs live in `lib/emailTemplates.ts`. EmailJS only needs ONE generic template:
- Subject: `{{subject}}`
- To email: `{{to_email}}`
- Content (HTML editor, "Code" view): `{{{html_body}}}` (three braces, so the HTML is not escaped)
Put its ID in `EMAILJS_TEMPLATE_ID`. Also enable "Allow EmailJS API for non-browser applications" in Account → Security.
`qr_code_url` must be publicly reachable, so the QR image in emails only shows once deployed (not on localhost).

## Notes
- Settings tab in the sheet = wedding details (edit there; cached 60 s).
- Check-ins are serialised with an in-process lock, so run **a single server instance** on the wedding day (one Node process / one serverless region instance is not guaranteed on Vercel; prefer a single VM/container).
- Rate limiting is in-memory (same single-instance caveat).

## Not built yet
Serwist service worker / installable icons (manifest only), charts, CSV export, event-settings editor UI, admin edit/add/delete guest, per-attendee check-in, Email Logs tab (email results go to the Audit tab), registration-date/relationship filters, tests.
