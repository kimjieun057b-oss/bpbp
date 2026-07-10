"use client";
import { useCallback, useMemo, useState } from "react";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import Toast from "../common/Toast";
import Link from "next/link";

interface RoomFormData {
    name: string;
    base_price: string;
    base_people: string;
    max_people: string;
    extra_person_price: string;
    quantity: string;
    description: string;
    image: File | null;
}

interface RoomFormOwnProps {
    editId?: string;
    initialData?: {
        name?: string;
        base_price?: number;
        base_people?: number;
        max_people?: number;
        extra_person_price?: number;
        quantity?: number;
        description?: string | null;
        image_url?: string | null;
    };
}

export default function RoomForm({ editId, initialData }: RoomFormOwnProps = {}) {
    const isEditMode = !!editId;

    const [form, setForm] = useState<RoomFormData>({
        name: initialData?.name ?? "",
        base_price: initialData?.base_price?.toString() ?? "",
        base_people: initialData?.base_people?.toString() ?? "2",
        max_people: initialData?.max_people?.toString() ?? "2",
        extra_person_price: initialData?.extra_person_price?.toString() ?? "0",
        quantity: initialData?.quantity?.toString() ?? "1",
        description: initialData?.description ?? "",
        image: null,
    });
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const existingImageUrl = initialData?.image_url ?? null;
    const previewUrl = useMemo(() => (form.image ? URL.createObjectURL(form.image) : existingImageUrl), [form.image, existingImageUrl]);

    const handleCloseToast: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            window.location.href = '/admin/room/status';
        }
        setVaild(value);
        setIsSuccess(false);
    };

    const { create, loading: createLoading } = useCreate('/api/admin/room', {
        onSuccess: () => { setIsSuccess(true); setVaild("객실이 등록되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const { update, loading: updateLoading } = useUpdate('/api/admin/room', {
        onSuccess: () => { setIsSuccess(true); setVaild("객실 정보가 수정되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const loading = isEditMode ? updateLoading : createLoading;

    const onChangeForm = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const onChangeImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, image: file }));
    }, []);

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!form.name.trim()) { setVaild("객실 이름을 입력해주세요."); return; }
        if (!form.base_price || Number(form.base_price) <= 0) { setVaild("1박당 가격을 입력해주세요."); return; }
        if (!form.base_people || Number(form.base_people) <= 0) { setVaild("기준 인원을 입력해주세요."); return; }
        if (!form.max_people || Number(form.max_people) < Number(form.base_people)) {
            setVaild("최대 인원은 기준 인원 이상이어야 합니다.");
            return;
        }
        if (!form.quantity || Number(form.quantity) <= 0) { setVaild("객실 개수를 입력해주세요."); return; }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('base_price', form.base_price);
        formData.append('base_people', form.base_people);
        formData.append('max_people', form.max_people);
        formData.append('extra_person_price', form.extra_person_price || '0');
        formData.append('quantity', form.quantity);
        formData.append('description', form.description);
        if (form.image) formData.append('file', form.image);

        if (isEditMode) {
            await update(editId, formData);
        } else {
            await create(formData);
        }
    }, [form, create, update, loading, isEditMode, editId]);

    const cancelHref = '/admin/room/status';

    return (
        <>
            <form onSubmit={onSubmitForm}>
                <div className="card space-y-5 p-6 md:p-8">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="form-label">
                            객실 이름 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="예: A동 디럭스"
                            value={form.name}
                            onChange={onChangeForm}
                            className="form-input"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="base_price" className="form-label">
                                1박당 가격(원) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                id="base_price"
                                name="base_price"
                                min={0}
                                value={form.base_price}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="quantity" className="form-label">
                                객실 개수 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                min={1}
                                value={form.quantity}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="base_people" className="form-label">
                                기준 인원 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                id="base_people"
                                name="base_people"
                                min={1}
                                value={form.base_people}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="max_people" className="form-label">
                                최대 인원 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                id="max_people"
                                name="max_people"
                                min={1}
                                value={form.max_people}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="extra_person_price" className="form-label">
                                인원 추가 요금(1인당·1박)
                            </label>
                            <input
                                type="number"
                                id="extra_person_price"
                                name="extra_person_price"
                                min={0}
                                value={form.extra_person_price}
                                onChange={onChangeForm}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="description" className="form-label">설명</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            placeholder="객실/사이트에 대한 안내나 부대시설 등을 입력해주세요."
                            value={form.description}
                            onChange={onChangeForm}
                            className="form-input"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="form-label">이미지</label>
                        <div className="flex items-center gap-4">
                            {previewUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewUrl} alt="객실 이미지 미리보기" className="h-16 w-16 rounded-lg object-cover" />
                            )}
                            <div className="flex items-center gap-3">
                                <input type="file" id="image" name="image" accept="image/*" className="hidden" onChange={onChangeImage} />
                                <label
                                    htmlFor="image"
                                    className="shrink-0 cursor-pointer rounded-lg bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-gray-200"
                                >
                                    이미지 선택
                                </label>
                                <span className="truncate text-sm text-muted">
                                    {form.image?.name ?? (existingImageUrl ? "기존 이미지 사용 중" : "선택된 이미지 없음")}
                                </span>
                            </div>
                        </div>
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
