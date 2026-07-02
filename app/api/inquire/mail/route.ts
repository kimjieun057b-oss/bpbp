import { google } from "googleapis";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { buildMailHtml } from "@/lib/mailTemplate";

/*
[메일 문의]
npm install googleapis
npm install nodemailer
npm install -D @types/nodemailer
1. 라이브러리 - gmail api 사용하기
2. https://developers.google.com/oauthplayground/ : refresh token 발급
   -> 엑세스 토큰 인증 만료 문제 -> 리프래시 ㅅ토큰으로 사용자 재인증없이 보안 유지하면서 토큰을 발급
   -> 백그라운드에서 주기석으로 Google API에 접근해야하는 서비스에 필수
3. OAuth 2.0 playground > 설정 > Use your own OAuth credentials 옵션 체크
4. scope 선택 > Authorize APIs > Exchange authorization code for tokens
- gmail.send : 문의 폼이 들어왔을 때 메일을 발송하는 권한
- 3단계 : POST / Request url: https://www.googleapis.com/gmail/v1/users/me/messages/send
5. Redirect URL : https://developers.google.com/oauthplayground 추가
 */

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

    const emailHtml = buildMailHtml({
      title,
      name,
      phone,
      email,
      fax,
      contents,
    });

    // 메일 내용
    const mailOptions = {
      from: `000 문의 <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `[신규 문의] ${name} 신규 문의가 접수 되었습니다.`,
      html: emailHtml,
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