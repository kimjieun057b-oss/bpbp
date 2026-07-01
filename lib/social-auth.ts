import { supabase } from "@/lib/supabase";

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 💡 로그인이 완료된 후 사용자를 복귀시킬 우리 사이트의 주소
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