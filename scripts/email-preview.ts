/**
 * Writes static HTML previews of transactional emails under tmp/email-preview/.
 * Loads .env.local then .env so NEXTAUTH_URL / asset URLs match local config.
 *
 * Usage: pnpm email:preview
 * Then open the .html files in a browser (file:// is fine).
 */
import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildAccountWelcomeEmail } from "@/lib/email/templates/account-welcome";
import { buildAuthLinkEmail } from "@/lib/email/templates/auth-link";
import { buildContactNotificationEmail } from "@/lib/email/templates/contact-notification";

config({ path: ".env.local" });
config();

const outDir = join(process.cwd(), "tmp", "email-preview");

async function main() {
  await mkdir(outDir, { recursive: true });

  const welcome = await buildAccountWelcomeEmail({ name: "Ada" });
  await writeFile(join(outDir, "account-welcome.html"), welcome.html, "utf8");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const invite = await buildAuthLinkEmail({
    type: "invite",
    name: "Ada",
    url: "https://wardwise.ng/set-password/preview-token",
    expiresAt,
  });
  await writeFile(join(outDir, "auth-invite.html"), invite.html, "utf8");

  const reset = await buildAuthLinkEmail({
    type: "password_reset",
    name: "Ada",
    url: "https://wardwise.ng/reset-password/preview-token",
    expiresAt,
  });
  await writeFile(join(outDir, "auth-password-reset.html"), reset.html, "utf8");

  const contact = await buildContactNotificationEmail({
    name: "Jane Campaign",
    email: "jane@example.com",
    reason: "demo",
    reasonDetails: "",
    message:
      "We would like a short walkthrough of WardWise Collect for our senatorial campaign.",
    submittedAt: new Date("2026-05-03T14:00:00.000Z"),
    sourcePath: "/contact",
  });
  await writeFile(
    join(outDir, "contact-notification.html"),
    contact.html,
    "utf8",
  );

  const contactWithContext = await buildContactNotificationEmail({
    name: "Jane Campaign",
    email: "jane@example.com",
    reason: "support",
    reasonDetails: "Cannot access dashboard after invite",
    message: "Steps to reproduce: …",
    submittedAt: new Date("2026-05-03T14:00:00.000Z"),
    sourcePath: "/contact",
  });
  await writeFile(
    join(outDir, "contact-notification-with-context.html"),
    contactWithContext.html,
    "utf8",
  );

  console.log(`\nEmail previews written to ${outDir}/`);
  console.log("  Open the .html files in your browser.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
