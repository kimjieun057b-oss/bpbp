"use client";
import { useCallback, useEffect, useState } from "react";
import QuillEditor from "../board/QuillEditor";
import { InquireBoardFormProps } from "@/types/type";
import Toast from "../common/Toast";
import Link from "next/link";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { supabase } from "@/lib/supabase";

interface InquireBoardFormOwnProps {
    editId?: number;
    initialData?: Partial<Omit<InquireBoardFormProps, 'file_url'>>;
    // 수정 대상 글의 작성자 user_id (로그인한 본인 글이면 비밀번호 없이 수정 가능)
    ownerUserId?: string | null;
}

// 비회원, 회원 상관없이 문의남김 - 비밀글 (비밀번호)
// 만약에 회원이 문의를 남기면, 회원정보를 가져와서 이메일을 자동으로 채워주고,이름도 자동으로 채워준다. 
// 비밀번호는 직접 입력해야함
// 회원이 남긴 문의는 비밀번호 없이 회원이 조회 가능 (수정 시에도 비밀번호 인증 X)
export default function InquireBoardUserForm({ editId, initialData, ownerUserId }: InquireBoardFormOwnProps = {}) {
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

    // 회원 여부 확인 user ID
    const [userId, setUserId] = useState<string | null>(null);

    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // 로그인 회원 정보 가져오기 (수정 모드에서는 본인 글 여부 확인을 위해서만 사용)
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            // 신규 작성 시에만 회원 정보로 이름/이메일을 자동 채움
            if (isEditMode) return;

            const email = user.email ?? "";
            const [mailId, mailAddress] = email.split("@");

            // 이름은 supabase 메타데이터에 등록된 이름이 있다면 쓰고, 없으면 이메일 ID를 임시로 노출
            const userName = user.user_metadata?.name || user.user_metadata?.full_name || mailId;

            setForm((prev) => ({
                ...prev,
                name: userName,
                mail_id: mailId || "",
                mail_address: mailAddress || "",
            }));
        };
        checkUser();
    }, [isEditMode]);

    // 로그인한 회원 본인이 작성한 글을 수정하는 경우 (비밀번호 입력 없이 수정 가능)
    const isOwnerEdit = isEditMode && !!ownerUserId && !!userId && ownerUserId === userId;

    const handleCloseToast: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            window.location.href = '/inquire';
        }
        setVaild(value);
        setIsSuccess(false);
    };

    const { create, loading: createLoading } = useCreate('/api/inquire/board-user', {
        onSuccess: () => { setIsSuccess(true); setVaild("문의가 등록되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const { update, loading: updateLoading } = useUpdate('/api/inquire/board-user', {
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
        if (!isOwnerEdit && !form.password_hash.trim()) { setVaild("비밀번호를 입력해주세요."); return; }
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

        // 새 글 작성 시, 회원이라면 DB에 user_id를 함께 저장
        if(!isEditMode && userId) {
            formData.append('user_id', userId);
        }

        if (isEditMode) {
            if (isOwnerEdit) {
                formData.append('user_id', userId!);
            } else {
                formData.append('password', form.password_hash);
            }
            await update(editId, formData);
        } else {
            formData.append('password_hash', form.password_hash);
            await create(formData);
        }
    }, [form, create, update, loading, isEditMode, editId, isOwnerEdit, userId]);

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
                            className="form-input disabled:bg-gray-50 disabled:text-muted"
                            disabled={!!userId && !isEditMode}
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
                                disabled={!!userId && !isEditMode}
                                className="form-input disabled:bg-gray-50 disabled:text-muted"
                            />
                            <span className="text-body shrink-0">@</span>
                            <input
                                type="text"
                                id="mail_address"
                                name="mail_address"
                                placeholder="도메인"
                                value={form.mail_address}
                                onChange={onChangeForm}
                                disabled={!!userId && !isEditMode} 
                                className="form-input disabled:bg-gray-50 disabled:text-muted"
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

                    {isOwnerEdit ? (
                        <p className="text-xs text-muted">회원 본인 글은 비밀번호 입력 없이 수정할 수 있습니다.</p>
                    ) : (
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
                    )}

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
