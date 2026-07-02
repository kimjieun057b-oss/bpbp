"use client";
import { signInWithGoogle, signInWithKakao } from "@/lib/social-auth";
import { useState } from "react";

export default function SocialLoginForm() {
    // Social login (supabase auth)

    const [googleLoading, setGoogleLoading] = useState(false);
    const [kakaoLoading, setKakaoLoading] = useState(false);

    const onClickGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await signInWithGoogle();
        } catch (error) {
            alert("구글 로그인에 실패했습니다. 다시 시도해주세요.");
            setGoogleLoading(false);
        }
    }

    const onClickKakaoLogin = async () => {
        try {
            setKakaoLoading(true);
            await signInWithKakao();
        } catch (error) {
            alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
            setKakaoLoading(false);
        }
    }

    const disabled = googleLoading || kakaoLoading;

    return (
        <div className="flex flex-col gap-2">
            <button type="button" onClick={onClickGoogleLogin} disabled={disabled} className="btn-ghost w-full text-center text-sm">
                {googleLoading ? "Logging in..." : "Google login"}
            </button>
            <button type="button" onClick={onClickKakaoLogin} disabled={disabled} className="btn-ghost w-full text-center text-sm">
                {kakaoLoading ? "Logging in..." : "Kakao login"}
            </button>
        </div>
    )
}