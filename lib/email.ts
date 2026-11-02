import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
// anything a user typed (like the name) is escaped before it goes into HTML
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

let transporter: Transporter | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) throw new Error("Email is not configured");

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

async function sendEmail(message: { to: string; subject: string; html: string; text: string }) {
  await getTransporter().sendMail({
    // Gmail always sends from the logged-in account, so the address is fixed
    from: { name: process.env.EMAIL_FROM_NAME ?? "Onward", address: process.env.GMAIL_USER! },
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  name: string;
  link: string;
  minutes: number;
}) {
  const first = args.name.split(" ")[0];

  await sendEmail({
    to: args.to,
    subject: "Reset your Onward password",
    text: [
      `Hi ${first},`,
      "",
      `Open this link to choose a new password. It works once and expires in ${args.minutes} minutes:`,
      args.link,
      "",
      "If you didn't ask for this, you can ignore this email. Your password stays the same.",
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#f8f8f4;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:28px;">
<p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#16a34a;">ONWARD</p>
<h1 style="margin:0 0 16px;font-size:22px;">Reset your password</h1>
<p style="margin:0 0 12px;line-height:1.5;">Hi ${esc(first)},</p>
<p style="margin:0 0 20px;line-height:1.5;">Click the button to choose a new password. The link works once and expires in ${args.minutes} minutes.</p>
<p style="margin:0 0 20px;"><a href="${esc(args.link)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px;">Choose a new password</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#78716c;line-height:1.5;">Button not working? Copy this address into your browser:<br><span style="word-break:break-all;">${esc(args.link)}</span></p>
<p style="margin:16px 0 0;font-size:13px;color:#78716c;line-height:1.5;">If you didn't ask for this, ignore this email. Your password stays the same.</p>
</div></body></html>`,
  });
}