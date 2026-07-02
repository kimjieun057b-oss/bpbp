"use client";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PasswordForm from "@/components/form/PasswordForm";
import Toast from "@/components/common/Toast";

// 회원 탈퇴 - 비밀번호 인증 후 진행
export default function WithdrawPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setEmail(user.email ?? null);
            }
        };
        fetchUser();
    }, []);

    // Header는 마운트 시에만 로그인 상태를 확인하므로 하드 리다이렉트로 갱신한다 (LogoutButton과 동일)
    const handleCloseToast: Dispatch<SetStateAction<string | null>> = (value) => {
        if (isSuccess && value === null) {
            window.location.href = '/';
            return;
        }
        setVaild(value);
    };

    const onSubmitPassword = useCallback(async (password: string) => {
        if (loading) return;

        if (!userId || !email) {
            setVaild("유저 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
            return;
        }
        if (!password.trim()) {
            setVaild("비밀번호를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            // 현재 비밀번호가 맞는지 재로그인 시도로 검증
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) {
                setVaild("비밀번호가 일치하지 않습니다.");
                return;
            }

            // ⚠️ 회원 탈퇴 구현 시 반드시 체크할 점: ON DELETE CASCADE or ON DELETE SET NULL 설정
            // Supabase Auth에서 유저 계정(auth.users)을 삭제할 때, 내가 커스텀으로 만든 일반 테이블(예: profiles, posts, orders 등)에
            // 유저 ID(user_id)가 이물질처럼 남아있으면 에러가 나거나 유령 데이터가 쌓이게 됩니다.
            // -> /api/auth/withdraw 에서 DB 설정에 의존하지 않고 앱 레벨에서 명시적으로 문의글/댓글/첨부파일을 먼저 삭제하도록 처리함
            const response = await fetch('/api/auth/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const result = await response.json();

            if (result.success) {
                await supabase.auth.signOut();
                setIsSuccess(true);
                setVaild(result.message);
            } else {
                setVaild(result.error || "탈퇴 처리에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            setVaild("탈퇴 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [userId, email, loading]);

    return (
        <>
        <article>
            <div>
                <div className="card max-w-sm mx-auto p-6">
                    <p className="text-sm text-body mb-4 text-center">
                        정말로 탈퇴하시겠습니까? 작성한 문의글을 포함한 모든 데이터가 삭제됩니다.
                    </p>
                    <PasswordForm onSubmit={onSubmitPassword} loading={loading} />
                </div>
            </div>
        </article>
        <Toast vaild={vaild} setVaild={handleCloseToast} />
        </>
    );
}
