"use client"
import { USER_CATEGORY } from "@/datas/categories";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButton";
import { supabase } from "@/lib/supabase";

export default function Header() {

    const [isLogin, setIsLogin] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.isLogin) {
                        setIsLogin(true);
                        setIsAdmin(data.isAdmin);
                        return;
                    }
                }
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setIsLogin(true);
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error("인증 상태 확인 실패:", err);
            }
        };
        checkAuth();
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-341.5 mx-auto px-5 pc:px-0 h-16 flex items-center justify-between">

                <div>
                    <h3 className="text-base font-bold">
                        <Link href="/" className="text-title hover:text-primary">HOME</Link>
                    </h3>
                </div>

                <nav>
                    <ul className="flex items-center gap-6">
                        {Object.entries(USER_CATEGORY).map(([key, c]) => {
                            const hasSubMenu = c.categories && c.categories.length > 0;
                            return (
                                <li key={key} className="relative group">
                                    {hasSubMenu ? (
                                        <p className="text-sm font-medium text-body cursor-default py-5">{c.title}</p>
                                    ) : (
                                        <Link href={`/${key}`} className="text-sm font-medium text-body hover:text-primary py-5 block">
                                            {c.title}
                                        </Link>
                                    )}
                                    {hasSubMenu && (
                                        <ul className="hidden absolute top-full left-0 mt-0 w-36 bg-white border border-gray-100 rounded-lg shadow-card group-hover:block py-1 z-50">
                                            {c.categories!.map((sub) => (
                                                <li key={sub.url}>
                                                    <Link
                                                        href={`/${key}/${sub.url}`}
                                                        className="block px-4 py-2.5 text-sm text-body hover:text-primary hover:bg-surface transition-colors"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}

                        {isLogin ? (
                            <li><LogoutButton /></li>
                        ) : (
                            <li>
                                <Link href="/login" className="text-sm font-medium text-body hover:text-primary">
                                    로그인
                                </Link>
                            </li>
                        )}

                        {isLogin && (
                            isAdmin ? (
                                <li>
                                    <Link href="/admin" className="text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                                        관리자모드
                                    </Link>
                                </li>
                            ) : (
                                <li>
                                    <Link href="/mypage" className="text-sm font-medium text-body hover:text-primary">
                                        마이페이지
                                    </Link>
                                </li>
                            )
                        )}

                        {!isLogin && (
                            <li>
                                <Link href="/join" className="text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                                    회원가입
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
