"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoomGallery, { RoomItem } from "@/components/admin/RoomGallery";
import { UNIT_LABEL } from "@/config/terms";

export default function RoomStatusPage() {
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/admin/room');
                const { data } = await res.json();
                setRooms(data ?? []);
            } catch (err: any) {
                console.error("Fail data load...", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-title">{UNIT_LABEL} 상태/요금 관리</h2>
                <Link href="/admin/room/status/new" className="btn-primary">
                    {UNIT_LABEL} 등록
                </Link>
            </div>

            {loading ? (
                <p className="px-5 py-8 text-center text-sm text-muted">정보를 불러오는 중입니다.</p>
            ) : (
                // 진행중 : 갤러리형, 리스트형 선택해서 렌더링
                <RoomGallery rooms={rooms} getHref={(room) => `/admin/room/status/${room.id}/edit`} />
            )}
        </div>
    )
}
