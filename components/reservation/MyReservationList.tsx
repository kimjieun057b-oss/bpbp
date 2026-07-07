"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePagination } from "@/hooks/usePagination";
import { ReservationDetail, STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/reservationDetail";
import Pagination from "../common/Pagination";

const ITEMS_PER_PAGE = 8;

export default function MyReservationList() {
    const [reservations, setReservations] = useState<ReservationDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const { currentItems, totalCount, onPageChange } = usePagination(reservations, ITEMS_PER_PAGE);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsLoggedIn(false);
                    return;
                }

                const res = await fetch(`/api/reservation/my?user_id=${user.id}`);
                const { data } = await res.json();
                setReservations(data ?? []);
            } catch (err: any) {
                console.error("Fail data load...", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (!isLoggedIn) return <div className="loading">로그인 후 이용할 수 있습니다.</div>;
    if (reservations.length === 0) return <div className="loading">예약 내역이 없습니다.</div>;

    return (
        <>
            <ul className="card divide-y divide-gray-100 min-h-106">
                {currentItems.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={`/mypage/reservations/${item.id}`}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-surface transition-colors"
                        >
                            <span className="text-sm text-title truncate flex-1">{item.room_name}</span>
                            <span className="text-xs text-muted shrink-0 hidden sm:block">
                                {item.check_in} ~ {item.check_out}
                            </span>
                            <span className={`badge ${STATUS_BADGE_CLASS[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                            <span className="text-xs text-muted shrink-0">
                                {new Date(item.created_at).toLocaleDateString("ko-KR")}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Pagination
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={onPageChange}
            />
        </>
    );
}
