"use client";
import { useCallback, useState } from "react";
import QuillEditor from "../board/QuillEditor";
import { NoticeFormProps } from "@/types/type";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import Toast from "../common/Toast";
import Link from "next/link";

interface NoticeFormOwnProps {
    editId?: number;
    initialData?: { title?: string; contents?: string; file_url?: string | null };
}

export default function NoticeForm({ editId, initialData }: NoticeFormOwnProps = {}) {
    const isEditMode = !!editId;

    const [form, setForm] = useState<NoticeFormProps>({
        title: initialData?.title ?? "",
        contents: initialData?.contents ?? "",
        file_url: null,
    });
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const existingFileUrl = initialData?.file_url ?? null;
    const existingFileName = existingFileUrl
        ? decodeURIComponent(existingFileUrl.split('/').pop() || '').replace(/^\d+_/, '')
        : null;

    const handleCloseToast: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            window.location.href = isEditMode
                ? `/admin/operation/notices/${editId}`
                : '/admin/operation/notices';
        }
        setVaild(value);
        setIsSuccess(false);
    };

    const { create, loading: createLoading } = useCreate('/api/notice', {
        onSuccess: () => { setIsSuccess(true); setVaild("게시글이 등록되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const { update, loading: updateLoading } = useUpdate('/api/notice', {
        onSuccess: () => { setIsSuccess(true); setVaild("게시글이 수정되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const loading = isEditMode ? updateLoading : createLoading;

    const onChangeForm = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, file_url: file }));
    }, []);

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!form.title.trim()) { setVaild("제목을 입력해주세요."); return; }
        if (!form.contents.replace(/<[^>]*>/g, '').trim()) { setVaild("내용을 입력해주세요."); return; }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('contents', form.contents);
        if (form.file_url) formData.append('file', form.file_url);

        if (isEditMode) {
            await update(editId, formData);
        } else {
            await create(formData);
        }
    }, [form, create, update, loading, isEditMode, editId]);

    const cancelHref = isEditMode ? `/admin/operation/notices/${editId}` : '/admin/operation/notices';

    return (
        <>
            <form onSubmit={onSubmitForm}>
                <div className="card p-6 md:p-8 space-y-5">

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="title" className="form-label">
                            제목 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="제목을 입력해주세요."
                            value={form.title}
                            onChange={onChangeForm}
                            className="form-input"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="form-label">
                            내용 <span className="text-red-400">*</span>
                        </label>
                        <QuillEditor
                            value={form.contents}
                            onChange={(contents) => setForm((prev) => ({ ...prev, contents }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="form-label">첨부파일</label>
                        <div className="flex items-center gap-3">
                            <input type="file" id="file" name="file" className="hidden" onChange={onChangeFile} />
                            <label
                                htmlFor="file"
                                className="px-4 py-2 bg-surface hover:bg-gray-200 text-body text-sm font-medium rounded-lg cursor-pointer transition-colors shrink-0"
                            >
                                파일 선택
                            </label>
                            <span className="text-sm text-muted truncate">
                                {form.file_url?.name ?? existingFileName ?? "선택된 파일 없음"}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <Link href={cancelHref} className="btn-ghost flex-1 text-center">
                            취소
                        </Link>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading
                                ? (isEditMode ? "수정 중..." : "등록 중...")
                                : (isEditMode ? "수정" : "등록")}
                        </button>
                    </div>
                </div>
            </form>
            <Toast vaild={vaild} setVaild={handleCloseToast} />
        </>
    );
}
