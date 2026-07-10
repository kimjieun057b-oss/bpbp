"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePagination } from "@/hooks/usePagination";
import { ReservationDetail } from "@/lib/reservationDetail";
import { getDisplayStatus, CUSTOMER_STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/reservationStatus";
import Pagination from "../common/Pagination";

const ITEMS_PER_PAGE = 8;
const GRID_COLS = "grid-cols-[60px_minmax(140px,1fr)_minmax(140px,1fr)_minmax(100px,0.6fr)_minmax(100px,0.6fr)]";

export default function MyReservationList() {
    const [reservations, setReservations] = useState<ReservationDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const { currentItems, currentPage, totalCount, onPageChange } = usePagination(reservations, ITEMS_PER_PAGE);

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
            <div className={`card grid ${GRID_COLS} min-h-40`}>
                <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">객실</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">기간</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">상태</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">예약일</span>

                {currentItems.map((item, index) => {
                    const displayStatus = getDisplayStatus(item.status, item.check_in);
                    return (
                        <Link key={item.id} href={`/mypage/reservations/${item.id}`} className="contents group">
                            <span className="flex items-center justify-center border-b border-gray-100 px-2 py-4 text-center text-sm text-muted transition-colors group-hover:bg-surface">
                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                            </span>
                            <span className="flex items-center justify-center truncate border-b border-gray-100 px-5 py-4 text-center text-sm text-title transition-colors group-hover:bg-surface">
                                {item.room_name}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted transition-colors group-hover:bg-surface">
                                {item.check_in} ~ {item.check_out}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center transition-colors group-hover:bg-surface">
                                <span className={`badge ${CUSTOMER_STATUS_BADGE_CLASS[displayStatus]}`}>{STATUS_LABEL[displayStatus]}</span>
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted transition-colors group-hover:bg-surface">
                                {new Date(item.created_at).toLocaleDateString("ko-KR")}
                            </span>
                        </Link>
                    );
                })}
            </div>
            <Pagination
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={onPageChange}
            />
        </>
    );
}
