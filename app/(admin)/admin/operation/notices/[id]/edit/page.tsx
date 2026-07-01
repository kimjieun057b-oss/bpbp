"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NoticeForm from "@/components/form/NoticeForm";

interface NoticeData {
    id: number;
    title: string;
    contents: string;
    file_url: string | null;
}

export default function AdminNoticeEditPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [noticeData, setNoticeData] = useState<NoticeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/notice/${id}`)
            .then((res) => res.json())
            .then(({ data }) => setNoticeData(data ?? null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading">데이터를 불러오는 중입니다.</div>;
    if (!noticeData) return <div className="loading">게시글을 찾을 수 없습니다.</div>;

    return (
        <div>
            <h4 className="mb-4 text-title">공지사항 수정</h4>
            <NoticeForm
                editId={noticeData.id}
                initialData={{
                    title: noticeData.title,
                    contents: noticeData.contents,
                    file_url: noticeData.file_url,
                }}
            />
        </div>
    );
}
