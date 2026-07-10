"use client";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/authErrorMessages";
import Toast from "@/components/common/Toast";

// 이메일로 받은 비밀번호 재설정 링크로 진입하는 페이지
export default function ResetPasswordPage() {
    const [ready, setReady] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const prepareSession = async () => {
            const code = new URLSearchParams(window.location.search).get("code");

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    setVaild("재설정 링크가 유효하지 않거나 만료되었습니다. 다시 시도해주세요.");
                    return;
                }
            }

            setReady(true);
        };
        prepareSession();
    }, []);

    const handleCloseToast: Dispatch<SetStateAction<string | null>> = (value) => {
        if (isSuccess && value === null) {
            // Header 등 세션을 한 번만 확인하는 컴포넌트가 남아있으므로,
            // 소프트 네비게이션 대신 하드 리다이렉트로 앱을 새로 로드시킨다. (LogoutButton과 동일한 방식)
            window.location.href = '/login';
            return;
        }
        setVaild(value);
    };

    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;

        if (!password.trim()) {
            setVaild("새 비밀번호를 입력해주세요.");
            return;
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!passwordRegex.test(password)) {
            setVaild("비밀번호는 8자 이상이어야 하며, 영문과 숫자를 모두 포함해야 합니다.");
            return; // 조건에 맞지 않으면 Supabase 요청을 보내지 않음
        }
        if (password !== passwordConfirm) {
            setVaild("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw new Error(error.message);

            // 비밀번호 재설정 링크로 생성된 세션을 종료해, 새 비밀번호로 다시 로그인하도록 강제한다.
            await supabase.auth.signOut();

            setIsSuccess(true);
            setVaild("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        } catch (err: any) {
            setVaild(translateAuthError(err.message) || "비밀번호 변경에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [password, passwordConfirm, loading]);

    if (!ready) return <div className="loading">확인 중입니다...</div>;

    return (
        <>
        <article>
            <div>
                <div>
                    {/* <h2>비밀번호 재설정</h2> */}
                    <p>새로운 비밀번호를 입력해주세요.</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="form-label">새 비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="새 비밀번호를 입력해주세요."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="passwordConfirm" className="form-label">새 비밀번호 확인</label>
                        <input
                            type="password"
                            id="passwordConfirm"
                            name="passwordConfirm"
                            placeholder="새 비밀번호를 다시 입력해주세요."
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            autoComplete="new-password"
                            className="form-input"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? "변경 중..." : "비밀번호 변경"}
                    </button>
                </form>
            </div>
        </article>
        <Toast vaild={vaild} setVaild={handleCloseToast} />
        </>
    );
}
