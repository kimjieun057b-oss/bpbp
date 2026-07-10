"use client";
import { useEffect, useState } from "react";
import RoomGallery, { RoomItem } from "@/components/admin/RoomGallery";

export default function RoomPage() {
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/reservation/rooms');
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
        <article>
            <div>
                <div>
                    {/* <h2>room</h2> */}
                </div>
                <div>
                    {loading ? (
                        <p className="px-5 py-8 text-center text-sm text-muted">정보를 불러오는 중입니다.</p>
                    ) : (
                        <RoomGallery rooms={rooms} />
                    )}
                </div>
            </div>
        </article>
    )
}
