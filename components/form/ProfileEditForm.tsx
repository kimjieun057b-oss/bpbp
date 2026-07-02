"use client";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import Toast from "../common/Toast";

interface ProfileEditFormProps {
    userId: string;
    currentName: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// 마이페이지 - 회원정보(이름 / 비밀번호) 수정
export default function ProfileEditForm({ userId, currentName, onSuccess, onCancel }: ProfileEditFormProps) {
    const [name, setName] = useState(currentName);
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // 이름/비밀번호가 바뀔 수 있으므로, 안내 토스트를 닫으면 그때 상위에서 로그아웃 후 재로그인시킨다.
    const handleCloseToast: Dispatch<SetStateAction<string | null>> = (value) => {
        if (isSuccess && value === null) {
            onSuccess();
            return;
        }
        setVaild(value);
    };

    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;

        if (!name.trim()) {
            setVaild("이름을 입력해주세요.");
            return;
        }
        // 비밀번호는 선택 입력이므로, 값이 있을 때만 형식을 검증한다.
        if (password && !PASSWORD_REGEX.test(password)) {
            setVaild("비밀번호는 8자 이상이어야 하며, 영문과 숫자를 모두 포함해야 합니다.");
            return;
        }
        if (password && password !== passwordConfirm) {
            setVaild("변경할 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    name: name.trim(),
                    password: password.trim() || undefined,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || '회원정보 수정에 실패했습니다.');

            setIsSuccess(true);
            setVaild("회원정보가 수정되었습니다. 다시 로그인해주세요.");
        } catch (err: any) {
            setVaild(err.message || '서버 내부 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [name, password, passwordConfirm, userId, loading]);

    return (
        <>
            <form onSubmit={onSubmit} className="card p-6 space-y-4 mt-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="form-label">이름</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="form-label">새 비밀번호 (선택)</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="변경하지 않으려면 비워두세요."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="form-input"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="passwordConfirm" className="form-label">새 비밀번호 확인</label>
                    <input
                        type="password"
                        id="passwordConfirm"
                        name="passwordConfirm"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        autoComplete="new-password"
                        className="form-input"
                    />
                </div>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button type="button" onClick={onCancel} className="btn-ghost flex-1">
                        취소
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                        {loading ? "저장 중..." : "저장"}
                    </button>
                </div>
            </form>
            <Toast vaild={vaild} setVaild={handleCloseToast} />
        </>
    );
}
