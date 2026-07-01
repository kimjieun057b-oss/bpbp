"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/common/Toast";
import PasswordForm from "@/components/form/PasswordForm";
import { useDelete } from "@/hooks/useDelete";
import CommentForm from "../form/CommentForm";
import CommentList from "./CommentList";

interface InquireDetail {
    id: number;
    category: string;
    name: string;
    mail_id: string;
    mail_address: string;
    title: string;
    contents: string;
    file_url: string | null;
    privacy: boolean;
    created_at: string;
    updated_at: string | null;
}

export default function InquireDetail() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();

    const [detail, setDetail] = useState<InquireDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [pendingDelete, setPendingDelete] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [vaild, setVaild] = useState<string | null>(null);
    const [commentRefreshKey, setCommentRefreshKey] = useState(0);

    const handleToastSetVaild: Dispatch<SetStateAction<string | null>> = (val) => {
        if (isSuccess && val === null) router.push('/inquire');
        setVaild(val);
        if (val === null) {
            setPendingDelete(false);
            setIsSuccess(false);
        }
    };

    const { remove, loading: deleteLoading } = useDelete('/api/inquire/board', {
        onSuccess: () => {
            setShowDeleteConfirm(false);
            setDeletePassword("");
            setPendingDelete(false);
            setIsSuccess(true);
            setVaild("삭제 완료되었습니다.");
        },
        onError: (message) => {
            setVaild(message);
            setDeletePassword("");
            setPendingDelete(false);
        },
    });

    const fetchDetail = async (pw?: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inquire/board/${id}`, {
                headers: pw ? { 'X-Password': pw } : {},
            });
            const result = await res.json();

            if (result.error === "REQUIRED_PASSWORD") {
                setIsPrivate(true);
                return;
            }
            if (result.error === "INVALID_PASSWORD") {
                setVaild("비밀번호가 일치하지 않습니다.");
                return;
            }
            if (!res.ok) {
                setVaild(result.error || "데이터를 불러오지 못했습니다.");
                return;
            }

            setDetail(result.data);
            setIsPrivate(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then(({ isAdmin }) => setIsAdmin(!!isAdmin));
        fetchDetail();
    }, [id]);

    const handlePasswordSubmit = (pw: string) => {
        if (!pw.trim()) { setVaild("비밀번호를 입력해주세요."); return; }
        fetchDetail(pw);
    };

    const handlePasswordConfirm = () => {
        if (!deletePassword.trim()) { setVaild("비밀번호를 입력해주세요."); return; }
        setVaild("삭제하시겠습니까?");
        setPendingDelete(true);
    };

    if (loading) return <div className="loading">데이터를 불러오는 중입니다.</div>;

    if (isPrivate) {
        return (
            <>
                <article>
                    <div>
                        <div className="card max-w-sm mx-auto">
                            <div className="h-0.5 bg-primary" />
                            <div className="p-6">
                                <p className="text-sm text-body mb-4 text-center">비밀글입니다. 비밀번호를 입력해주세요.</p>
                                <PasswordForm onSubmit={handlePasswordSubmit} loading={loading} />
                                <button
                                    onClick={() => router.back()}
                                    className="w-full mt-3 btn-ghost text-sm"
                                >
                                    목록으로
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
                <Toast vaild={vaild} setVaild={handleToastSetVaild} />
            </>
        );
    }

    if (!detail) return <div className="loading">게시글을 찾을 수 없습니다.</div>;

    return (
        <>
            <article>
                <div>
                    <div className="card">
                        <div className="h-0.5 bg-primary" />

                        {/* 제목 / 메타 */}
                        <div className="px-6 py-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-0.5 rounded">
                                    {detail.category}
                                </span>
                                {detail.privacy && (
                                    <span className="text-xs font-medium text-muted bg-gray-100 px-2 py-0.5 rounded">
                                        비밀글
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-title">{detail.title}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted">{detail.name}</span>
                                <span className="text-xs text-muted">
                                    {new Date(detail.created_at).toLocaleDateString("ko-KR")}
                                </span>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div
                            className="px-6 py-8 text-sm text-body leading-relaxed prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: detail.contents }}
                        />

                        {/* 첨부파일 */}
                        {detail.file_url && (() => {
                            const raw = decodeURIComponent(detail.file_url!.split('/').pop() || '');
                            const fileName = raw.includes('_') ? raw.slice(raw.indexOf('_') + 1) : raw;
                            return (
                                <div className="px-6 pb-4">
                                    <a
                                        href={detail.file_url!}
                                        download={fileName}
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                    >
                                        📎 {fileName}
                                    </a>
                                </div>
                            );
                        })()}

                        {/* 액션 */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                            <button onClick={() => router.back()} className="btn-ghost text-xs px-4 py-2">
                                목록
                            </button>
                            {!isAdmin && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/inquire/${id}/edit`)}
                                        className="btn-ghost text-xs px-4 py-2"
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowDeleteConfirm(true); setDeletePassword(""); }}
                                        disabled={deleteLoading}
                                        className="text-xs px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {deleteLoading ? "삭제 중" : "삭제"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 삭제 비밀번호 확인 */}
                        {!isAdmin && showDeleteConfirm && (
                            <div className="px-6 pb-5 flex gap-2">
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="비밀번호 입력"
                                    autoComplete="current-password"
                                    className="form-input flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={handlePasswordConfirm}
                                    disabled={deleteLoading}
                                    className="btn-primary shrink-0"
                                >
                                    확인
                                </button>
                            </div>
                        )}
                    </div>
                    <CommentForm
                        inquireId={id!}
                        isAdmin={isAdmin}
                        onSuccess={() => setCommentRefreshKey((k) => k + 1)}
                    />
                    <CommentList
                        inquireId={id!}
                        isAdmin={isAdmin}
                        refreshKey={commentRefreshKey}
                    />
                </div>
            </article>
            <Toast
                vaild={vaild}
                setVaild={handleToastSetVaild}
                onConfirm={pendingDelete ? () => remove(id!, { body: { password: deletePassword } }) : undefined}
            />
        </>
    );
}
