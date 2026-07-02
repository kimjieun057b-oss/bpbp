"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
