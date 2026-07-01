"use client";
import { useState } from "react";

interface CommentFormProps {
    inquireId: string;
    isAdmin: boolean;
    onSuccess: () => void;
}

export default function CommentForm({ inquireId, isAdmin, onSuccess }: CommentFormProps) {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) { setError("댓글을 입력해주세요."); return; }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/inquire/board/${inquireId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment }),
            });
            const result = await res.json();
            if (!res.ok) { setError(result.error || "등록에 실패했습니다."); return; }
            setComment("");
            onSuccess();
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 card p-5">
            <h3 className="text-sm font-semibold text-title mb-3">
                {isAdmin ? "답변 작성" : "댓글 작성"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isAdmin ? "답변을 입력해주세요." : "댓글을 입력해주세요."}
                    rows={3}
                    className="form-input resize-none"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="btn-primary text-xs px-5 py-2">
                        {loading ? "등록 중..." : (isAdmin ? "답변 등록" : "댓글 등록")}
                    </button>
                </div>
            </form>
        </div>
    );
}
