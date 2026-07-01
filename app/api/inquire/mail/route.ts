import { google } from "googleapis";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";

// 메일 문의
// npm install googleapis
// npm install nodemailer
// npm install -D @types/nodemailer
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const fax = formData.get("fax") as string;
    const contents = formData.get("contents") as string;
    const file = formData.get("file") as File | null;

    // OAuth2 클라이언트 설정
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" 
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // 액세스 토큰 자동 생성
    const accessToken = await oauth2Client.getAccessToken();

    // Nodemailer 설정 (Gmail API OAuth2 모드)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token || '',
      },
    } as any);

    // 첨부파일 처리
    const attachments: Options['attachments'] = [];

    if (file) {
      const arrayBuffer = await file.arrayBuffer(); // File 객체를 ArrayBuffer로 읽음
      const buffer = Buffer.from(arrayBuffer); // Buffer로 변환

      attachments.push({
        filename: file.name,
        content: buffer, // Buffer 형태로 첨부
        contentType: file.type,
      });
    }

    // 메일 내용
    const mailOptions = {
      from: `000 문의 <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `[신규 문의] ${name} 신규 문의가 접수 되었습니다.`,
      html: `
        <div style="padding: 20px 0;">
            <div style="margin-top: 20px;">
                <div style="margin-bottom: 100px;">
                    <h2 style="margin-bottom: 8px; font-size: 1.7rem;">${title}</h2>
                    <p style="font-size: 1.1rem">${contents}</p>
                </div>
                <ul style="width: 400px; list-style: none; padding: 0;">
                    <li style="font-size: 1rem; padding: 20px 8px; border-bottom: 1px solid #ddd; border-top: 2px solid #034694;">
                      <strong>회사명/이름 :</strong> <span style="color: #555;">${name}</span>
                    </li>
                    <li style="font-size: 1rem; padding: 20px 8px; border-bottom: 1px solid #ddd;">
                      <strong>연락처 :</strong> <span style="color: #555;">${phone}</span>
                    </li>
                      <li style="font-size: 1rem; padding: 20px 8px; border-bottom: 1px solid #ddd;">
                    <strong>이메일 :</strong> <span style="color: #555;">${email}</span>
                    </li>
                      <li style="font-size: 1rem; padding: 20px 8px; border-bottom: 1px solid #ddd;">
                    <strong>팩스 :</strong> <span style="color: #555;">${fax ? fax : "-"}</span>
                    </li>
                </ul>
            </div>
        </div>
      `,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    // 전송
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('메일 전송 에러:', error);
    return NextResponse.json({ error: error.message || "서버 내부 오류" }, { status: 500 });
  }
}