"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoomForm from "@/components/form/RoomForm";
import Toast from "@/components/common/Toast";

interface RoomData {
    id: string;
    name: string;
    base_price: number;
    base_people: number;
    max_people: number;
    extra_person_price: number;
    quantity: number;
    description: string | null;
    image_url: string | null;
}

export default function AdminRoomEditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [room, setRoom] = useState<RoomData | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/admin/room/${id}`);
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "객실 정보를 불러오지 못했습니다.");
                setRoom(result.data);
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
            const res = await fetch(`/api/admin/room/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "삭제에 실패했습니다.");
            router.push("/admin/room/status");
        } catch (err: any) {
            setVaild(err.message || "서버 내부 오류가 발생했습니다.");
            setDeleting(false);
        }
    };

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (!room) return <div className="loading">{vaild || "객실 정보를 찾을 수 없습니다."}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-title">객실 수정</h2>
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
                        객실 삭제
                    </button>
                )}
            </div>

            <RoomForm
                editId={room.id}
                initialData={{
                    name: room.name,
                    base_price: room.base_price,
                    base_people: room.base_people,
                    max_people: room.max_people,
                    extra_person_price: room.extra_person_price,
                    quantity: room.quantity,
                    description: room.description,
                    image_url: room.image_url,
                }}
            />
            <Toast vaild={vaild} setVaild={setVaild} />
        </div>
    );
}
