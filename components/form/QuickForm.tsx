"use client";
import { useCreate } from "@/hooks/useCreate";
import { ChangeEvent, useCallback, useState } from "react"
import Toast from "../common/Toast";

// 빠른 간편 상담
export default function QuickForm() {
    const [form, setForm] = useState({
        name: "",
        phoneFront: "010",
        phoneMiddle: "",
        phoneLast: "",
        privacy: false
    });
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const handleCloseToast: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            window.location.reload();
        }
        setVaild(value);
        setIsSuccess(false);
    }

    const onChangeForm = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue =
            type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value;

        setForm(prev => ({
            ...prev,
            [name]: newValue,
        }));
    }, []);

    const { create, loading } = useCreate('/api/inquire/quick', {
        onSuccess: () => { setIsSuccess(true); setVaild("문의가 등록되었습니다."); },
        onError: (message) => setVaild(message),
    });

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if(loading) return;

        if (!form.name.trim() || !form.phoneMiddle.trim()
            || !form.phoneLast.trim()) {
            setVaild("필수 항목을 입력해주세요. (이름, 연락처, 문의 내용)");
            return;
        }

        const phone = form.phoneFront + form.phoneMiddle + form.phoneLast;
        if (!/^[0-9]{10,11}$/.test(phone)) {
            setVaild("숫자만 입력해주세요.");
            return;
        }

        if (!form.privacy) {
            setVaild("개인정보 수집 및 이용 동의를 해주세요.");
            return
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('phoneFront', form.phoneFront);
        formData.append('phoneMiddle', form.phoneMiddle);
        formData.append('phoneLast', form.phoneLast);
        formData.append('privacy', String(form.privacy));

        await create(formData);

    }, [form, create])

    return (
        <>
         <form onSubmit={onSubmitForm}>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="form-label">
                    이름
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
                <legend className="form-label"><h3>연락처</h3></legend>
                <div className="display-flex">
                    <input
                        type="text"
                        inputMode="numeric"
                        id="phoneFront"
                        name="phoneFront" maxLength={3}
                        onChange={onChangeForm}
                        value={form.phoneFront} />
                    <p>-</p>
                    <input
                        type="text"
                        inputMode="numeric"
                        id="phoneMiddle"
                        name="phoneMiddle"
                        maxLength={4}
                        onChange={onChangeForm}
                        value={form.phoneMiddle} />
                    <p>-</p>
                    <input
                        type="text"
                        inputMode="numeric"
                        id="phoneLast"
                        name="phoneLast"
                        maxLength={4}
                        onChange={onChangeForm}
                        value={form.phoneLast} />
                </div>
            </div>
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
            <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "문의 중...": "간편 문의 신청"}
            </button>
        </form>
        <Toast vaild={vaild} setVaild={handleCloseToast}/>
        </>
       
    )
}