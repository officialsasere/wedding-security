import "dotenv/config"; import bcrypt from "bcryptjs";
(async () => {
  const { initSheets, all, add } = await import("../lib/sheets"); const { uid, now } = await import("../lib/util");
  await initSheets();
  if (!(await all("Users")).length) await add("Users", { id: uid("usr"), fullName: "Administrator", email: process.env.ADMIN_EMAIL!, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10), role: "admin", status: "Active", createdAt: now(), updatedAt: now() });
  if (!(await all("Settings")).length) for (const [key, value] of Object.entries({ coupleNames: "KaroGotHisGift26", weddingTitle: "Our Wedding", weddingDate: "2027-01-01", weddingTime: "2:00 PM", venue: "Venue name", venueAddress: "Venue address", regOpen: "", regClose: "" })) await add("Settings", { key, value, updatedAt: now() });
  console.log("Sheets initialised. Edit the Settings tab to change wedding details.");
})();
