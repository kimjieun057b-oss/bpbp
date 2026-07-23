"use client";
import { useCallback, useState } from "react";
import QuillEditor from "../board/QuillEditor";
import Toast from "../common/Toast";
import Link from "next/link";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";

export interface InquireBoardFormProps {
    name: string;
    category: string;
    mail_id: string;
    mail_address: string;
    title: string;
    contents: string;
    password_hash: string;
    file_url: File | null;
    privacy: boolean;
}

interface InquireBoardFormOwnProps {
    editId?: number;
    initialData?: Partial<Omit<InquireBoardFormProps, 'file_url'>>;
}

// 비회원, 회원 상관없이 문의남김 - 비밀글 (비밀번호)
export default function InquireBoardForm({ editId, initialData }: InquireBoardFormOwnProps = {}) {
    const isEditMode = !!editId;

    const [form, setForm] = useState<InquireBoardFormProps>({
        name: initialData?.name ?? "",
        category: initialData?.category ?? "",
        mail_id: initialData?.mail_id ?? "",
        mail_address: initialData?.mail_address ?? "",
        title: initialData?.title ?? "",
        contents: initialData?.contents ?? "",
        password_hash: initialData?.password_hash ?? "",
        file_url: null,
        privacy: initialData?.privacy ?? false,
    });

    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCloseToast: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            window.location.href = '/inquire';
        }
        setVaild(value);
        setIsSuccess(false);
    };

    const { create, loading: createLoading } = useCreate('/api/inquire/board', {
        onSuccess: () => { setIsSuccess(true); setVaild("문의가 등록되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const { update, loading: updateLoading } = useUpdate('/api/inquire/board', {
        onSuccess: () => { setIsSuccess(true); setVaild("문의가 수정되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const loading = isEditMode ? updateLoading : createLoading;

    const onChangeForm = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setForm((prev) => ({ ...prev, [name]: checked }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, file_url: file }));
    }, []);

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!form.name.trim()) { setVaild("이름을 입력해주세요."); return; }
        if (!form.category.trim()) { setVaild("분류를 선택해주세요."); return; }
        if (!form.mail_id.trim() || !form.mail_address.trim()) { setVaild("이메일을 입력해주세요."); return; }
        if (!form.title.trim()) { setVaild("제목을 입력해주세요."); return; }
        if (!form.contents.replace(/<[^>]*>/g, '').trim()) { setVaild("내용을 입력해주세요."); return; }
        if (!form.password_hash.trim()) { setVaild("비밀번호를 입력해주세요."); return; }
        if (!isEditMode && !form.privacy) { setVaild("개인정보처리방침을 동의해주세요."); return; }

        const formData = new FormData();
        formData.append('category', form.category);
        formData.append('name', form.name);
        formData.append('mail_id', form.mail_id);
        formData.append('mail_address', form.mail_address);
        formData.append('title', form.title);
        formData.append('contents', form.contents);
        formData.append('privacy', String(form.privacy));
        if (form.file_url) formData.append('file', form.file_url);

        if (isEditMode) {
            formData.append('password', form.password_hash);
            await update(editId, formData);
        } else {
            formData.append('password_hash', form.password_hash);
            await create(formData);
        }
    }, [form, create, update, loading, isEditMode, editId]);

    const cancelHref = isEditMode ? `/inquire/${editId}` : '/inquire';

    return (
        <>
            <form onSubmit={onSubmitForm}>
                <div className="card p-6 md:p-8 space-y-5">

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="category" className="form-label">
                            분류 <span className="text-red-400">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={onChangeForm}
                            className="form-input"
                        >
                            <option value="">선택해 주세요.</option>
                            <option value="일반 문의">일반 문의</option>
                            <option value="제휴 문의">제휴 문의</option>
                            <option value="시스템 오류">시스템 오류</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="form-label">
                            이름 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="이름을 입력해주세요."
                            value={form.name}
                            onChange={onChangeForm}
                            className="form-input"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="form-label">
                            이메일 <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                id="mail_id"
                                name="mail_id"
                                placeholder="이메일 아이디"
                                value={form.mail_id}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                            <span className="text-body shrink-0">@</span>
                            <input
                                type="text"
                                id="mail_address"
                                name="mail_address"
                                placeholder="도메인"
                                value={form.mail_address}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                        </div>
                    </div>

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
                        <label htmlFor="password_hash" className="form-label">
                            비밀번호 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="password"
                            id="password_hash"
                            name="password_hash"
                            placeholder="게시글의 비밀번호를 입력해주세요."
                            value={form.password_hash}
                            onChange={onChangeForm}
                            autoComplete={isEditMode ? "current-password" : "new-password"}
                            className="form-input"
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
                                {form.file_url?.name ?? "선택된 파일 없음"}
                            </span>
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="privacy"
                                name="privacy"
                                checked={form.privacy}
                                onChange={onChangeForm}
                                className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <label htmlFor="privacy" className="text-sm text-body cursor-pointer">
                                개인정보처리방침 동의
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <Link href={cancelHref} className="btn-ghost flex-1 text-center">
                            취소
                        </Link>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading
                                ? (isEditMode ? "수정 중..." : "등록 중...")
                                : (isEditMode ? "수정" : "문의하기")}
                        </button>
                    </div>
                </div>
            </form>
            <Toast vaild={vaild} setVaild={handleCloseToast} />
        </>
    );
}
