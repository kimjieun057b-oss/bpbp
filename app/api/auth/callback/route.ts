import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

// 소셜 로그인 후 리다이렉트 처리용 Callback
// 구글 로그인을 마치고 돌아온 사용자의 URL에는 인증 토큰이 포함되어 있는데
// 해당 토큰을 supabase 세션으로 바꾸고, 쿠키에 로그인 정보를 저장하는 서버 핸들러가 필요

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // 💡 라우트 핸들러 전용 Supabase 클라이언트를 생성하여 쿠키와 세션을 연동
    const cookieStore = cookies();
    
    // 주소창에 넘어온 code를 던져서 사용자의 정식 세션(Session)을 발급
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인이 최종 완료되면 이동할 주소 (메인 페이지 또는 마이페이지 등)
  return NextResponse.redirect(new URL("/", request.url));
}