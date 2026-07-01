"use client";
import { useCallback, useState } from "react";

interface PasswordFormProps {
    onSubmit: (password: string) => void;
    loading?: boolean;
}

export default function PasswordForm({ onSubmit, loading = false }: PasswordFormProps) {
    const [password, setPassword] = useState<string>("");

    const onChangePassword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

    const onSubmitForm = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(password);
    }, [onSubmit, password]);

    return (
        <form onSubmit={onSubmitForm} className="space-y-3">
            {/* 웹 접근성: 비밀번호 단독 폼의 hidden username 필드 */}
            <input type="text" name="username" autoComplete="username" className="hidden" />
            <div>
                <label htmlFor="password" className="form-label">비밀번호</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="비밀번호를 입력해주세요."
                    onChange={onChangePassword}
                    value={password}
                    autoComplete="current-password"
                    className="form-input"
                />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "확인 중..." : "확인"}
            </button>
        </form>
    );
}
