"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 소셜 로그인(구글/카카오) 완료 후 Supabase가 돌아오는 콜백 페이지
// PKCE 플로우로 로그인을 시작했을 때 발급되는 code_verifier는 로그인을 시작한
// 브라우저의 localStorage에 저장되기 때문에, code 교환은 반드시 그 브라우저의
// 클라이언트 컴포넌트에서 처리해야 한다 (서버 라우트 핸들러는 해당 저장소에 접근할 수 없어 실패함).
// 예전에는 app/api/auth/callback/route.ts(서버 라우트)에서 처리했지만,
// signInWithGoogle()의 redirectTo가 `/auth/callback`(이 경로)을 가리키고 있어
// 그 서버 라우트는 애초에 호출조차 되지 않았고, 설령 경로가 맞았더라도
// 서버에서는 code_verifier가 없어 세션 교환이 실패했을 것이다.
export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const finishLogin = async () => {
            const code = new URLSearchParams(window.location.search).get("code");

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) console.error("소셜 로그인 세션 교환 실패:", error);
            }

            router.replace("/");
        };
        finishLogin();
    }, [router]);

    return <div className="loading">로그인 처리 중입니다...</div>;
}
