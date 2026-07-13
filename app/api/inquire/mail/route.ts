import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildMailHtml } from "@/lib/mailTemplate";
import { sendMail } from "@/lib/gmail";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('inquire_mail')
    .select('id, name, title, is_answered, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/*
[메일 문의]
npm install googleapis
1. Gmail API를 googleapis 패키지로 직접 호출 (nodemailer 미사용)
2. https://developers.google.com/oauthplayground/ : refresh token 발급
   -> 엑세스 토큰 인증 만료 문제 -> 리프래시 토큰으로 사용자 재인증없이 보안 유지하면서 토큰을 발급
   -> 백그라운드에서 주기적으로 Google API에 접근해야하는 서비스에 필수
3. OAuth 2.0 playground > 설정 > Use your own OAuth credentials 옵션 체크
4. scope 선택 > Authorize APIs > Exchange authorization code for tokens
- gmail.send : 문의 폼이 들어왔을 때 메일을 발송하는 권한
- Redirect URL : https://developers.google.com/oauthplayground 등록 필요
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

    const emailHtml = buildMailHtml({ title, name, phone, email, fax, contents });

    // 첨부파일 처리
    const attachments = [];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      attachments.push({
        filename: file.name,
        content: Buffer.from(arrayBuffer),
        contentType: file.type,
      });
    }

    const subject = `[신규 문의] 문의가 접수 되었습니다. <${name}>`;
    await sendMail({
      to: process.env.RECEIVER_EMAIL!,
      subject,
      html: emailHtml,
      fromName: "신규 문의",
      attachments,
    });

    // 메일 발송 성공 후 관리자 페이지 문의 목록에 노출하기 위해 기록
    const { error: insertError } = await supabaseAdmin
      .from('inquire_mail')
      .insert({ title, name, phone, email, fax: fax || null, contents });

    if (insertError) {
      console.error('메일 문의 기록 저장 에러:', insertError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('메일 전송 에러:', error);
    return NextResponse.json({ error: error.message || "서버 내부 오류" }, { status: 500 });
  }
}