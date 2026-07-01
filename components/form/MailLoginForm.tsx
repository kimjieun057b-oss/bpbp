"use client";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import Toast from "../common/Toast";
import SocialLoginForm from "./SocialLoginForm";

type Mode = "login" | "signup";

export default function MailLoginForm() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);

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

            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw new Error(error.message);
                // supabase dashboard > Authenitication > Providers > Email > confirm email 활성화
                setVaild("가입 확인 이메일이 발송되었습니다. 이메일을 확인해주세요.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw new Error(error.message);
                window.location.href = '/';
            }
        } catch (err: any) {
            if (err.message === "Invalid login credentials") {
                    setVaild("가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다.");
                } else {
                    setVaild(err.message);
                }
        } finally {
            setLoading(false);
        }
    }, [email, password, loading, mode]);

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
                <p>비밀번호를 잊으셨나요?</p>
                {/* 소셜 로그인 */}
                <SocialLoginForm/>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button type="button"
                        onClick={() => 
                            {
                                setMode(mode === "login" ? "signup" : "login");
                                setEmail("");
                                setPassword("");
                        }} className="btn-ghost flex-1 text-center">
                        {mode === "login" ?
                            "이메일로 회원가입"
                            : "로그인으로 돌아가기"}
                    </button>
                    <button type="submit"
                        disabled={loading}
                        className="btn-primary flex-1">
                        {loading ? "처리 중..." :
                            mode === "login" ? "로그인"
                                : "회원가입"}
                    </button>
                </div>
            </form>
            <Toast vaild={vaild} setVaild={setVaild} />
        </>
    );
}
