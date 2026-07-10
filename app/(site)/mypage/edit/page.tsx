"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileEditForm from "@/components/form/ProfileEditForm";

// 회원정보(이름 / 비밀번호) 수정
export default function EditProfilePage() {
    const router = useRouter();

    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);
                    setUserName(user.user_metadata?.name || user.user_metadata?.full_name || "");
                    setUserPhone(user.user_metadata?.phone || "");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // 이름/비밀번호가 바뀔 수 있으므로, 수정 완료 후에는 로그아웃시켜 다시 로그인하도록 한다.
    const handleSuccess = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) return <div className="loading">확인 중입니다...</div>;
    if (!userId) return <div className="loading">로그인 후 이용할 수 있습니다.</div>;

    return (
        <article>
            <div>
                <div>
                    {/* <h2>회원정보 수정</h2> */}
                </div>
                <ProfileEditForm
                    userId={userId}
                    currentName={userName}
                    currentPhone={userPhone}
                    onSuccess={handleSuccess}
                    onCancel={() => router.push('/mypage')}
                />
            </div>
        </article>
    );
}
