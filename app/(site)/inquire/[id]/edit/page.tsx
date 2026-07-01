"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InquireBoardForm from "@/components/form/InquireBoardForm";
import PasswordForm from "@/components/form/PasswordForm";
import Toast from "@/components/common/Toast";
import InquireBoardUserForm from "@/components/form/InquireBoardUserForm";

interface InquireData {
    id: number;
    name: string;
    category: string;
    mail_id: string;
    mail_address: string;
    title: string;
    contents: string;
    privacy: boolean;
}

export default function InquireEditPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [inquireData, setInquireData] = useState<InquireData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [unlockedPassword, setUnlockedPassword] = useState("");
    const [vaild, setVaild] = useState<string | null>(null);

    const fetchData = async (pw?: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inquire/board/${id}`, {
                headers: pw ? { "X-Password": pw } : {},
            });
            const result = await res.json();

            if (result.error === "REQUIRED_PASSWORD") {
                setIsPrivate(true);
                return;
            }

            if (result.error === "INVALID_PASSWORD") {
                setIsPrivate(true);
                if (pw) setVaild("비밀번호가 일치하지 않습니다.");
                return;
            }

            if (!res.ok) {
                setVaild(result.error || "데이터를 불러오지 못했습니다.");
                return;
            }

            setInquireData(result.data);
            setIsPrivate(false);
            if (pw) setUnlockedPassword(pw);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handlePasswordSubmit = (pw: string) => {
        if (!pw.trim()) {
            setVaild("비밀번호를 입력해주세요.");
            return;
        }
        fetchData(pw);
    };

    if (loading) return <div className="loading">데이터를 불러오는 중입니다.</div>;

    if (isPrivate) {
        return (
            <>
                <article>
                    <div>
                        <PasswordForm onSubmit={handlePasswordSubmit} loading={loading} />
                    </div>
                </article>
                <Toast vaild={vaild} setVaild={setVaild} />
            </>
        );
    }

    if (!inquireData) return <div className="loading">게시글을 찾을 수 없습니다.</div>;

    return (
        <article>
            <div>
                {/* 비회원/회원 폼 */}
                <InquireBoardUserForm 
                editId={inquireData.id}
                    initialData={{
                        name: inquireData.name,
                        category: inquireData.category,
                        mail_id: inquireData.mail_id,
                        mail_address: inquireData.mail_address,
                        title: inquireData.title,
                        contents: inquireData.contents,
                        privacy: inquireData.privacy,
                        password_hash: unlockedPassword,
                    }}/>

                {/* 로그인 무관 폼 */}
                {/* <InquireBoardForm
                    editId={inquireData.id}
                    initialData={{
                        name: inquireData.name,
                        category: inquireData.category,
                        mail_id: inquireData.mail_id,
                        mail_address: inquireData.mail_address,
                        title: inquireData.title,
                        contents: inquireData.contents,
                        privacy: inquireData.privacy,
                        password_hash: unlockedPassword,
                    }}
                /> */}
            </div>
        </article>
    );
}
