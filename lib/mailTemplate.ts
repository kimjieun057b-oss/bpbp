import { siteConfig } from "@/config/site";

interface MailTemplateProps {
  title: string;
  name: string;
  phone: string;
  email: string;
  fax?: string;
  contents: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildMailHtml({
  title,
  name,
  phone,
  email,
  fax,
  contents,
}: MailTemplateProps) {
  const safeTitle = escapeHtml(title);
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeFax = fax ? escapeHtml(fax) : "-";
  const safeContents = escapeHtml(contents);

  return `
    <article style="background-color: #f4f6f8; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
      <div style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; border: 1px solid #f3f4f6; overflow: hidden; display: flex; flex-direction: column;">
        <div style="padding: 36px 36px 24px;">
          <span style="font-size: 12px; font-weight: 500; color: #2563eb; background-color: rgba(37, 99, 235, 0.1); padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 16px;">
            신규 문의
          </span>
          <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 10px 0; line-height: 1.375;">
            ${safeTitle}
          </h1>
          <p style="font-size: 14px; color: #9ca3af; margin: 0;">
            접수 일시: ${escapeHtml(new Date().toLocaleString("ko-KR"))}
          </p>
        </div>

        <section style="padding: 32px 36px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 14px 0;">
            문의 내용
          </h3>
          <div style="font-size: 14px; line-height: 2; color: #4b5563; background-color: #f4f6f8; padding: 20px; border-radius: 6px; border: 1px solid #f3f4f6; white-space: pre-wrap; min-height: 120px;">
            ${safeContents}
          </div>
        </section>

        <section style="padding: 32px 36px 36px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
            고객 정보
          </h3>

          <div style="display: flex; flex-direction: column; gap: 0;">
            <div style="display: flex; border-bottom: 1px solid #f3f4f6; padding: 12px 0;">
              <div style="width: 130px; font-size: 14px; color: #9ca3af; font-weight: 500; flex-shrink: 0;">
                고객명
              </div>
              <div style="font-size: 14px; color: #111827; font-weight: 600;">
                ${safeName}
              </div>
            </div>

            <div style="display: flex; border-bottom: 1px solid #f3f4f6; padding: 12px 0;">
              <div style="width: 130px; font-size: 14px; color: #9ca3af; font-weight: 500; flex-shrink: 0;">
                연락처
              </div>
              <div style="font-size: 14px; color: #111827; font-weight: 600;">
                ${safePhone}
              </div>
            </div>

            <div style="display: flex; border-bottom: 1px solid #f3f4f6; padding: 12px 0;">
              <div style="width: 130px; font-size: 14px; color: #9ca3af; font-weight: 500; flex-shrink: 0;">
                이메일 주소
              </div>
              <div style="font-size: 14px; color: #111827; font-weight: 600;">
                ${safeEmail}
              </div>
            </div>

            <div style="display: flex; padding: 12px 0;">
              <div style="width: 130px; font-size: 14px; color: #9ca3af; font-weight: 500; flex-shrink: 0;">
                팩스
              </div>
              <div style="font-size: 14px; color: #111827; font-weight: 600;">
                ${safeFax}
              </div>
            </div>
          </div>
        </section>

        <div style="background-color: #f4f6f8; padding: 18px 36px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
          본 메일은 ${siteConfig.name ? `${escapeHtml(siteConfig.name)} ` : ""}시스템에 의해 자동으로 발송된 알림 메일입니다.<br/> 본 수신함은 발송 전용입니다.
        </div>
      </div>
    </article>
  `;
}
