import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 관리자 Normal 로그인 상태 파악
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  // 쿠키가 존재하면 로그인 상태로 판별
  // 추후 쿠키 내부 토큰 검증 로직을 추가
  if (session && session.value === 'is_authenticated_true_secret_key') {
    return NextResponse.json({ isLogin: true, isAdmin: true });
  }

  return NextResponse.json({ isLogin: false, isAdmin: false });
}