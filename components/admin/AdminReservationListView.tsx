"use client";
import { Fragment, useMemo, useState } from "react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import ReservationStatusFilter from "../reservation/ReservationStatusFilter";
import {
    ADMIN_STATUS_BADGE_CLASS,
    ALL_DISPLAY_STATUSES,
    getDisplayStatus,
    ReservationStatus,
    STATUS_LABEL,
} from "@/lib/reservationStatus";
import { UNIT_LABEL } from "@/config/terms";

const GRID_COLS =
    "grid-cols-[60px_minmax(140px,1.3fr)_minmax(90px,0.8fr)_minmax(120px,0.9fr)_minmax(110px,0.9fr)_minmax(110px,0.9fr)_minmax(50px,0.4fr)_minmax(110px,auto)]";

// 관리자 목록에는 취소된 예약이 조회되지 않으므로 필터에서도 제외
const ADMIN_FILTER_STATUSES = ALL_DISPLAY_STATUSES.filter((s) => s !== "cancelled");

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatCreatedDateLabel(iso: string) {
    const d = new Date(iso);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
}

function formatPhone(phone: string) {
    if (phone.length === 11) return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    if (phone.length === 10) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    return phone;
}

export default function AdminReservationListView() {
    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [filter, setFilter] = useState<ReservationStatus | "all">("all");

    const { monthReservations, loading } = useAdminReservations(year, month);

    const handlePrevMonth = () => {
        setMonth((m) => {
            if (m === 0) {
                setYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const handleNextMonth = () => {
        setMonth((m) => {
            if (m === 11) {
                setYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    };

    const sorted = monthReservations
        .filter((r) => filter === "all" || getDisplayStatus(r.status, r.checkIn) === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return (
        <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-title">예약 리스트</h2>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={handlePrevMonth} className="px-2 py-1 text-body hover:text-primary" aria-label="이전 달">
                        ‹
                    </button>
                    <span className="text-sm text-title">
                        {year}년 {month + 1}월
                    </span>
                    <button type="button" onClick={handleNextMonth} className="px-2 py-1 text-body hover:text-primary" aria-label="다음 달">
                        ›
                    </button>
                </div>
                <ReservationStatusFilter
                    statuses={ADMIN_FILTER_STATUSES}
                    badgeClassMap={ADMIN_STATUS_BADGE_CLASS}
                    active={filter}
                    onChange={setFilter}
                />
            </div>

            {loading && <p className="px-5 py-8 text-center text-sm text-muted">정보를 불러오는 중입니다.</p>}

            {!loading && sorted.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-muted">조건에 맞는 예약이 없습니다.</p>
            )}

            {!loading && sorted.length > 0 && (
                <div className={`grid ${GRID_COLS}`}>
                    <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">{UNIT_LABEL}</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">예약자</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">연락처</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">기간</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">예약 날짜</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">인원</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">상태</span>

                    {sorted.map((r, index) => (
                        <Fragment key={r.id}>
                            <span className="flex items-center justify-center border-b border-gray-100 px-2 py-3.5 text-center text-sm text-muted">
                                {index + 1}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-title">
                                {r.roomName}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-body">
                                {r.guestName}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-muted">
                                {formatPhone(r.phone)}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-muted">
                                {formatDateLabel(r.checkIn)} ~ {formatDateLabel(r.checkOut)}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-muted">
                                {formatCreatedDateLabel(r.createdAt)}
                            </span>
                            <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-muted">
                                {r.people}인
                            </span>
                            <div className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5">
                                <span className={`badge ${ADMIN_STATUS_BADGE_CLASS[getDisplayStatus(r.status, r.checkIn)]}`}>
                                    {STATUS_LABEL[getDisplayStatus(r.status, r.checkIn)]}
                                </span>
                            </div>
                        </Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
