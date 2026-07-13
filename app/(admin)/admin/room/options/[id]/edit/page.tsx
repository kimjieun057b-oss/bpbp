"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoomOptionForm from "@/components/form/RoomOptionForm";
import Toast from "@/components/common/Toast";

interface RoomOptionData {
    id: string;
    label: string;
    price: number;
}

export default function AdminRoomOptionEditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [option, setOption] = useState<RoomOptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/admin/room-options/${id}`);
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "부가서비스 정보를 불러오지 못했습니다.");
                setOption(result.data);
            } catch (err: any) {
                setVaild(err.message || "서버 내부 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (deleting) return;
        try {
            setDeleting(true);
            const res = await fetch(`/api/admin/room-options/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "삭제에 실패했습니다.");
            router.push("/admin/room/options");
        } catch (err: any) {
            setVaild(err.message || "서버 내부 오류가 발생했습니다.");
            setDeleting(false);
        }
    };

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (!option) return <div className="loading">{vaild || "부가서비스 정보를 찾을 수 없습니다."}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-title">부가서비스 수정</h2>
                {confirmDelete ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-body">정말 삭제하시겠습니까?</span>
                        <button type="button" onClick={() => setConfirmDelete(false)} className="btn-ghost">
                            취소
                        </button>
                        <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
                            {deleting ? "삭제 중..." : "삭제 확정"}
                        </button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="btn-danger">
                        부가서비스 삭제
                    </button>
                )}
            </div>

            <RoomOptionForm
                editId={option.id}
                initialData={{
                    label: option.label,
                    price: option.price,
                }}
            />
            <Toast vaild={vaild} setVaild={setVaild} />
        </div>
    );
}
