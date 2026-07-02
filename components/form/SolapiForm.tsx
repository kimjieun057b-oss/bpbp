'use client'
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useState } from "react";

interface SolapiFormProps {
    name: string;
    phoneFront: string;
    phoneMiddle: string;
    phoneLast: string;
    request: string;
    privacy: boolean;
}

export default function SolapiForm() {

    const router = useRouter();

    const [vaild, setVaild] = useState<boolean>(false);
    const [phoneVaild, setPhoneVaild] = useState<boolean>(false);

    const [form, setForm] = useState<SolapiFormProps>({
        name: "",
        phoneFront: "010",
        phoneMiddle: "",
        phoneLast: "",
        request: "",
        privacy: false
    });

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

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim() || !form.phoneMiddle.trim()
            || !form.phoneLast.trim() || !form.request.trim()) {
            setVaild(true);
            alert("필수 항목을 입력해주세요. (이름, 연락처, 문의 내용)");
            return;
        }

        const phone = form.phoneFront + form.phoneMiddle + form.phoneLast;
        if (!/^[0-9]{10,11}$/.test(phone)) {
            setPhoneVaild(true);
            alert("숫자만 입력해주세요.");
            return;
        }

        if (!form.privacy) {
            alert("개인정보 수집 및 이용 동의를 해주세요.");
            return
        }

        // SMS 
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null) formData.append(key, value as any);
            });

            const response = await fetch("/api/inquire", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert("문의가 정상적으로 접수되었습니다.");
                router.push("/");
            } else {
                alert("문자 발송 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
        }

    }, [form]);

    return (
        <form onSubmit={onSubmitForm}>
            <div className="card p-6 md:p-8 space-y-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="form-label">이름 <span className="text-red-400">*</span></label>
                    <input type="text" id="name" name="name" placeholder="이름을 입력해주세요." onChange={onChangeForm} value={form.name} className="form-input" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="form-label">연락처 <span className="text-red-400">*</span></span>
                    <div className="flex items-center gap-2">
                        <input type="text" inputMode="numeric" id="phoneFront" name="phoneFront" maxLength={3} onChange={onChangeForm} value={form.phoneFront} className="form-input text-center" />
                        <span className="text-muted">-</span>
                        <input type="text" inputMode="numeric" id="phoneMiddle" name="phoneMiddle" maxLength={4} onChange={onChangeForm} value={form.phoneMiddle} className="form-input text-center" />
                        <span className="text-muted">-</span>
                        <input type="text" inputMode="numeric" id="phoneLast" name="phoneLast" maxLength={4} onChange={onChangeForm} value={form.phoneLast} className="form-input text-center" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="request" className="form-label">문의 내용</label>
                    <textarea id="request" name="request" rows={10} placeholder="문의 내용을 입력해주세요." onChange={onChangeForm} value={form.request} className="form-input" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="form-label">개인 정보 수집 및 이용 동의</label>
                    <div className="text-xs text-muted bg-surface rounded-lg p-3 space-y-1">
                        <p>아래의 개인 정보를 수집하며, 상담 외 다른 목적으로 사용되지 않습니다.</p>
                        <ul className="space-y-0.5">
                            <li>- 수집 항목 : 이름, 전화번호, 문의 내용</li>
                            <li>- 수집 및 이용 목적 : 가맹 문의 상담 및 고객 응대</li>
                            <li>- 보유 기간 : 문의일로부터 1년간 보관 후 즉시 파기</li>
                            <li>- 수집 방법 : 홈페이지 문의 접수</li>
                        </ul>
                        <p>접수된 문의 내용은 SMS 발송을 통해 [00000] 담당자에게 실시간 전달됩니다.</p>
                        <p>개인정보 수집에 동의하지 않으실 경우, 가맹 상담 서비스 제공이 제한될 수 있습니다.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="privacy" name="privacy" checked={form.privacy} onChange={onChangeForm} className="w-4 h-4 accent-primary cursor-pointer" />
                        <label htmlFor="privacy" className="text-sm text-body cursor-pointer">개인 정보 수집 및 이용에 동의합니다.</label>
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full">문의 접수하기</button>
            </div>
        </form>
    );
}
