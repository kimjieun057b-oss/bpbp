"use client";
import { useCallback, useState } from "react";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import Toast from "../common/Toast";
import Link from "next/link";

interface RoomOptionFormData {
    label: string;
    price: string;
}

interface RoomOptionFormOwnProps {
    editId?: string;
    initialData?: {
        label?: string;
        price?: number;
    };
}

export default function RoomOptionForm({ editId, initialData }: RoomOptionFormOwnProps = {}) {
    const isEditMode = !!editId;

    const [form, setForm] = useState<RoomOptionFormData>({
        label: initialData?.label ?? "",
        price: initialData?.price?.toString() ?? "",
    });
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCloseToast: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            window.location.href = '/admin/room/options';
        }
        setVaild(value);
        setIsSuccess(false);
    };

    const { create, loading: createLoading } = useCreate('/api/admin/room-options', {
        onSuccess: () => { setIsSuccess(true); setVaild("부가서비스가 등록되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const { update, loading: updateLoading } = useUpdate('/api/admin/room-options', {
        onSuccess: () => { setIsSuccess(true); setVaild("부가서비스 정보가 수정되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const loading = isEditMode ? updateLoading : createLoading;

    const onChangeForm = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!form.label.trim()) { setVaild("부가서비스명을 입력해주세요."); return; }
        if (form.price === '' || Number(form.price) < 0) { setVaild("가격을 입력해주세요."); return; }

        const payload = { label: form.label, price: Number(form.price) };

        if (isEditMode) {
            await update(editId, payload);
        } else {
            await create(payload);
        }
    }, [form, create, update, loading, isEditMode, editId]);

    const cancelHref = '/admin/room/options';

    return (
        <>
            <form onSubmit={onSubmitForm}>
                <div className="card space-y-5 p-6 md:p-8">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="label" className="form-label">
                            부가서비스명 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="label"
                            name="label"
                            placeholder="예: 바비큐 (숯불)"
                            value={form.label}
                            onChange={onChangeForm}
                            className="form-input"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="price" className="form-label">
                            가격(원) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            min={0}
                            value={form.price}
                            onChange={onChangeForm}
                            className="form-input"
                        />
                    </div>

                    <div className="flex gap-3 border-t border-gray-100 pt-2">
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
