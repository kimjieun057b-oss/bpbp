"use client";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/authErrorMessages";
import Toast from "../common/Toast";

// 이메일로 회원가입 (supabase auth)
export default function JoinForm() {
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

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!passwordRegex.test(password)) {
            setVaild("비밀번호는 8자 이상이어야 하며, 영문과 숫자를 모두 포함해야 합니다.");
            return; // 조건에 맞지 않으면 Supabase 요청을 보내지 않음
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw new Error(error.message);
            // supabase dashboard > Authentication > Providers > Email > confirm email 활성화
            setVaild("가입 확인 이메일이 발송되었습니다. 이메일을 확인해주세요.");
        } catch (err: any) {
            setVaild(translateAuthError(err.message) || "회원가입에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [email, password, loading]);

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="form-label">이메일</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="이메일을 입력해주세요"
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
                        placeholder="비밀번호를 입력해주세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="form-input"
                    />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? "처리 중..." : "회원가입"}
                </button>
            </form>
            <Toast vaild={vaild} setVaild={setVaild} />
        </>
    )
}
