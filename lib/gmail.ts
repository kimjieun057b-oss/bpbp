import { google } from "googleapis";

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

interface RawMailOptions {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}

function encodeMimeWord(text: string) {
  return `=?UTF-8?B?${Buffer.from(text, "utf-8").toString("base64")}?=`;
}

function wrapBase64(base64: string) {
  return base64.replace(/.{76}/g, "$&\r\n");
}

export function buildRawEmail({ fromName, fromEmail, to, subject, html, attachments = [] }: RawMailOptions) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const headers = [
    `From: ${encodeMimeWord(fromName)} <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${encodeMimeWord(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ].join("\r\n");

  const htmlPart = [
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(Buffer.from(html, "utf-8").toString("base64")),
  ].join("\r\n");

  const attachmentParts = attachments.map((attachment) => {
    const encodedFilename = encodeMimeWord(attachment.filename);
    return [
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${encodedFilename}"`,
      `Content-Disposition: attachment; filename="${encodedFilename}"`,
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64(attachment.content.toString("base64")),
    ].join("\r\n");
  });

  const raw = [headers, "", htmlPart, ...attachmentParts, `--${boundary}--`, ""].join("\r\n");

  return Buffer.from(raw, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  fromName: string;
  attachments?: MailAttachment[];
}

// Gmail API를 googleapis 패키지로 직접 호출해 메일 발송 (nodemailer 미사용)
// - OAuth2 refresh token으로 재인증 없이 인증 유지 (발급 방법은 app/api/inquire/mail/route.ts 참고)
export async function sendMail({ to, subject, html, fromName, attachments = [] }: SendMailOptions) {
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const raw = buildRawEmail({
    fromName,
    fromEmail: process.env.EMAIL_USER!,
    to,
    subject,
    html,
    attachments,
  });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
