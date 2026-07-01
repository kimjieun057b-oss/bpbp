"use client";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
    const [loading, setLoading] = useState(false);

    const onLogout = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        // 관리자(admin_session 쿠키)와 일반 회원(Supabase Auth)은 서로 다른 인증 체계라
        // 하나의 로그아웃 버튼이 둘 다 지원하려면 두 세션을 모두 명시적으로 해제해야 한다.
        // /api/login/logout 하나만 호출하면 admin_session 쿠키만 삭제되고 Supabase 세션은
        // 그대로 남아, 이메일/소셜 로그인 회원은 로그아웃 후에도 로그인 상태로 유지되는 문제가 있었다.
        await Promise.all([
            fetch('/api/login/logout', { method: 'POST' }),
            supabase.auth.signOut(),
        ]);
        window.location.href = '/login';
    }, [loading]);

    return (
        <button
            onClick={onLogout}
            disabled={loading}
            className="text-sm font-medium text-body hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
        >
            {loading ? "로그아웃 중..." : "로그아웃"}
        </button>
    );
}
