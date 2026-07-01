"use client";
import { useEffect, useState } from "react";

interface Comment {
    id: number;
    comment: string;
    is_admin: boolean;
    created_at: string;
}

interface CommentListProps {
    inquireId: string;
    isAdmin: boolean;
    refreshKey: number;
}

export default function CommentList({ inquireId, isAdmin, refreshKey }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inquire/board/${inquireId}/comment`);
            const { data } = await res.json();
            setComments(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [inquireId, refreshKey]);

    const handleDelete = async (commentId: number) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/inquire/board/${inquireId}/comment/${commentId}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchComments();
        } catch {}
    };

    if (loading) return <div className="mt-2 text-xs text-muted py-4 text-center">불러오는 중...</div>;
    if (comments.length === 0) return <div className="mt-2 text-xs text-muted py-4 text-center">등록된 댓글이 없습니다.</div>;

    return (
        <ul className="mt-2 space-y-2">
            {comments.map((c) => (
                <li
                    key={c.id}
                    className={`card p-4 ${c.is_admin ? 'border-l-2 border-l-primary bg-blue-50/40' : ''}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {c.is_admin && (
                                <span className="inline-block text-[10px] font-semibold text-primary bg-blue-100 px-1.5 py-0.5 rounded mb-1">
                                    관리자 답변
                                </span>
                            )}
                            <p className="text-sm text-body whitespace-pre-wrap wrap-break-word">{c.comment}</p>
                            <span className="text-xs text-muted mt-1 block">
                                {new Date(c.created_at).toLocaleString("ko-KR")}
                            </span>
                        </div>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => handleDelete(c.id)}
                                className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
