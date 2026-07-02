"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Toast from "../common/Toast";
import SocialLoginForm from "./SocialLoginForm";

// 이메일 로그인 (supabase auth)
export default function MailLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);

    // 비밀번호 재설정 (이메일로 재설정 링크 발송)
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const onSubmitReset = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (resetLoading) return;

        if (!resetEmail.trim()) {
            setVaild("이메일을 입력해주세요.");
            return;
        }

        try {
            setResetLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw new Error(error.message);

            setVaild("비밀번호 재설정 링크를 이메일로 보냈습니다. 메일함을 확인해주세요.");
            setShowReset(false);
            setResetEmail("");
        } catch (err: any) {
            setVaild(err.message || "재설정 메일 발송에 실패했습니다.");
        } finally {
            setResetLoading(false);
        }
    }, [resetEmail, resetLoading]);

    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;

        if (!email.trim()) {
            setVaild("이메일을 입력해주세요.");
            return;
        }
        if (!password.trim()) {
            setVaild("비밀번호를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error(error.message);
            window.location.href = '/';
        } catch (err: any) {
            if (err.message === "Invalid login credentials") {
                setVaild("가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다.");
            } else {
                setVaild(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [email, password, loading]);

    if (showReset) {
        return (
            <>
                <form onSubmit={onSubmitReset} className="space-y-4">
                    <div>
                        <label htmlFor="resetEmail" className="form-label">이메일</label>
                        <input
                            type="email"
                            id="resetEmail"
                            name="resetEmail"
                            placeholder="가입한 이메일을 입력해주세요"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <button type="submit"
                        disabled={resetLoading}
                        className="btn-primary w-full">
                        {resetLoading ? "발송 중..." : "재설정 링크 보내기"}
                    </button>
                    <button type="button"
                        onClick={() => setShowReset(false)}
                        className="btn-ghost w-full text-center">
                        로그인으로 돌아가기
                    </button>
                </form>
                <Toast vaild={vaild} setVaild={setVaild} />
            </>
        );
    }

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="form-label">이메일</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="form-label">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                </div>
                <button type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs text-muted hover:text-primary transition-colors">
                    비밀번호를 잊으셨나요?
                </button>
                <button type="submit"
                    disabled={loading}
                    className="btn-primary w-full">
                    {loading ? "처리 중..." : "로그인"}
                </button>
                {/* 소셜 로그인 */}
                <SocialLoginForm />
                <Link href="/join" className="btn-ghost w-full text-center block">
                    이메일로 회원가입
                </Link>
            </form>
            <Toast vaild={vaild} setVaild={setVaild} />
        </>
    );
}
