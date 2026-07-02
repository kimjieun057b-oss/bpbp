'use client'
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useState } from "react";

interface MailFormProps {
    title: string; // 제목
    name: string; // 회사명/이름
    phone: string; // 연락처
    email: string; // 이메일
    fax: string; // 팩스
    contents: string; // 문의내용
    file?: File | null; // 첨부파일
    privacy: boolean; // 개인정보처리방침
}

// 메일 문의
export default function MailForm() {

    const router = useRouter();
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    const [form, setForm] = useState<MailFormProps>({
        title: "",
        name: "",
        phone: "",
        email: "",
        fax: "",
        contents: "",
        file: null,
        privacy: false
    });

    const onChangeForm = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        const newValue =
            type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value;

        if (type === "file") {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0] ?? null;
            setForm(prev => ({ ...prev, file }));
            return;
        }

        setForm(prev => ({
            ...prev,
            [name]: newValue,
        }));
    }, []);

    const onSubmitForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitLoading) return;

        if (!form.name.trim()) {
            alert("회사명/이름 항목을 입력해주세요.")
            return;
        }
        if (!form.phone.trim()) {
            alert("연락처 항목을 입력해주세요.")
            return;
        }
        if (!/^[0-9]{10,11}$/.test(form.phone)) {
            alert("연락처는 숫자만 10~11자리로 입력해주세요.")
            return;
        }

        if (!form.email.trim()) {
            alert("이메일 항목을 입력해주세요.")
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            alert("올바른 이메일 양식을 입력해주세요.")
            return;
        }

        if (!form.contents.trim()) {
            alert("문의내용을 입력해주세요.");
            return;
        }

        if (!form.privacy) {
            alert("개인정보 수집 및 이용 동의를 해주세요.");
            return
        }

        if (form.file) {
            const ext = form.file.name.split('.').pop()?.toLowerCase() ?? "";
            const allowedExtensions = ["jpg", "jpeg"];
            if (!allowedExtensions.includes(ext)) {
                alert("JPG 파일만 업로드 가능합니다.");
                return;
            }
        }

        // API
        try {
            setSubmitLoading(true);

            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("name", form.name);
            formData.append("phone", form.phone);
            formData.append("email", form.email);
            formData.append("fax", form.fax);
            formData.append("contents", form.contents);
            formData.append("privacy", String(form.privacy));

            if (form.file) {
                formData.append("file", form.file);
            }

            const response = await fetch("/api/inquire", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert("문의가 정상적으로 접수되었습니다.");
                router.push("/");
            } else {
                alert(`문의 발송 중 오류가 발생했습니다. 다시 시도해주세요.`);
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setSubmitLoading(false);
        }

    }, [form, router]);

    return (
        <form onSubmit={onSubmitForm}>
            <div className="card p-6 md:p-8 space-y-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="title" className="form-label">제목 <span className="text-red-400">*</span></label>
                    <input type="text" id="title" name="title" placeholder="제목을 입력해주세요." onChange={onChangeForm} value={form.title} className="form-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="form-label">회사명/이름 <span className="text-red-400">*</span></label>
                    <input type="text" id="name" name="name" placeholder="회사명/이름을 입력해주세요." onChange={onChangeForm} value={form.name} className="form-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="form-label">연락처 <span className="text-red-400">*</span></label>
                    <input type="text" id="phone" name="phone" placeholder="연락처를 입력해주세요. (숫자만)" onChange={onChangeForm} value={form.phone} className="form-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="form-label">이메일 <span className="text-red-400">*</span></label>
                    <input type="email" id="email" name="email" placeholder="이메일을 입력해주세요." onChange={onChangeForm} value={form.email} className="form-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="fax" className="form-label">팩스</label>
                    <input type="text" id="fax" name="fax" placeholder="팩스번호를 입력해주세요." onChange={onChangeForm} value={form.fax} className="form-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="contents" className="form-label">문의 내용 <span className="text-red-400">*</span></label>
                    <textarea id="contents" name="contents" rows={7} placeholder="문의 내용을 입력해주세요." onChange={onChangeForm} value={form.contents} className="form-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="file" className="form-label">첨부파일 (선택)</label>
                    <input type="file" id="file" name="file" accept=".jpg,.jpeg" onChange={onChangeForm} className="text-sm text-body" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="form-label">개인정보처리방침안내 <span className="text-red-400">*</span></label>
                    <div className="text-xs text-muted bg-surface rounded-lg p-3 space-y-1">
                        <p>00000은 고객님을 위한 개인정보 처리방침을 다음과 같이 알려드립니다.<br />아래의 개인 정보를 수집하며, 상담 외 다른 목적으로 사용되지 않습니다.</p>
                        <ul className="space-y-0.5">
                            <li>⦁ 수집 항목 : 회사명, 이름, 연락처, 이메일, 문의 내용</li>
                            <li>⦁ 수집 및 이용 목적 : 문의 상담 및 고객 응대</li>
                            <li>⦁ 보유 기간 : 문의일로부터 1년간 보관 후 즉시 파기</li>
                            <li>⦁ 수집 방법 : 홈페이지 문의 접수</li>
                        </ul>
                        <p>접수 완료 후, 빠른 시일 내에 연락 드리겠습니다.</p>
                        <p>개인정보 수집에 동의하지 않으실 경우, 상담 서비스 제공이 제한될 수 있습니다.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="privacy" name="privacy" checked={form.privacy} onChange={onChangeForm} className="w-4 h-4 accent-primary cursor-pointer" />
                        <label htmlFor="privacy" className="text-sm text-body cursor-pointer">개인 정보 수집 및 이용에 동의합니다.</label>
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full">{submitLoading ? "접수 중..." : "문의 접수하기"}</button>
            </div>
        </form>
    );
}
