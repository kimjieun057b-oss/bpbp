import { supabase } from "@/lib/supabase";

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 로그인이 완료된 후 사용자를 복귀시킬 우리 사이트의 주소
        // /auth/callback : 사용자가 우리 사이트가 아닌 소셜 로그인 화면으로 이동했다가 돌아오는 방식 -> 그 돌아오는 주소를 미리 등록해야함
        // Google Cloud Console 에서 리다이렉트 URL: 'supabase project URL/auth/v1/callback' 등록
        // supabase 대시보드 > Authentication > URL Configuration > redirectTo와 동일한 주소를 모두 등록
        redirectTo: `${window.location.origin}/auth/callback`,
        
        // 구글 로그인 시 매번 계정을 새로 선택할 수 있게 강제하는 옵션 (선택)
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("구글 로그인 진행 중 에러 발생:", error);
    throw error;
  }
};

// [ 진행중 : 10줄 참고해서 리다이렉트 url 등록하기 ]
export const signInWithKakao = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("카카오 로그인 진행 중 에러 발생:", error);
    throw error;
  }
};

 /* [구글]

  1. Google Cloud Console : OQuth 2.0 Client ID 발급
  2. supabase Authenitication > URL Configuration's Redirect URLS에서 ...auth/callback 추가

 ----------
    1. signInWithGoogle()호출하여 구글 화면으로 이동
    2. 로그인 성공 시, redirectTo에 지정한 /auth/callback으로 돌아옴
    - supabase로 리다이렉트 -> supabase가 인증코드를 붙여서 /auth/callback으로 다시 리다이렉트
    3. /auth/callback/page.tsx 가 url의 ?code= 값을 supabase.auth.exchangeCodeForSession(code)로 세션 교환
    - 실제 로그인 세션을 발급 받고 홈 (/)으로 이동
    */

    /*
    [구글 로그인 시, 새창에서 ---supabase.co서비스로 로그인이 뜸..]
    1. Google Cloud Console > supabase 구글 로그인 설정할때 사용한 프로젝트 선택
    2. API & Service > OAuth 동의 화면 > 브랜딩
    3. 앱 이름, 사용자 지원 이메일, 앱 로고, 개발자 연락처
    4. 검수 필요, 테스트상태로 내 계정으로만 테스트 가능, 서비스 출시 시, 구글에 검수 요청을 보내 승인받아야 정상적으로 표시
*/

/* [카카오톡]

  1. kakao developers > 앱실행 > 플랫폼 설정 > Redirect URL 설정
  2. supabase 설정

*/

