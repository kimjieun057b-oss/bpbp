"use client";
import { signInWithGoogle, signInWithKakao } from "@/lib/social-auth";
import { useState } from "react";
export default function SocialLoginForm() {
    // 3. Social login (supabase auth)

    const [loading, setLoading] = useState(false);

    const onClickGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (error) {
            alert("구글 로그인에 실패했습니다. 다시 시도해주세요.");
            setLoading(false);
        }
    }

    const onClickKakaoLogin = async () => {
        try {
            setLoading(true);
            await signInWithKakao();
        } catch (error) {
            alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
            setLoading(false);
        }
    }

    return (
        <div className="flex gap-2">
            <button type="button" onClick={onClickGoogleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Google login"}
            </button>
            <button type="button" onClick={onClickKakaoLogin} disabled={loading}>
                {loading ? "Logging in..." : "Kakao login"}
            </button>
        </div>
    )

    // google login : google cloude 인증 플랫폼 -> OAuth 2.0 클라이언트 ID 발급 -> supabase auth 설정, supabase authentication > URL Configuration의 Redirect URLs에서 .../auth/callback 추가 -> supabase auth 로그인 로직 구현
    // kakao login : kakao developers -> 앱 생성 -> 플랫폼 설정 -> redirect uri 설정 -> supabase auth 설정 -> supabase auth 로그인 로직 구현 (https://jun-coding.tistory.com/770 참고)
}