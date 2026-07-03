interface MailAttachment {
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
