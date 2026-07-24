"use client";
import { Fragment, useEffect, useState } from "react";
import { AdminReservationItem } from "@/lib/adminReservation";
import { ADMIN_STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/reservationStatus";
import { UNIT_LABEL } from "@/config/terms";

const GRID_COLS =
    "grid-cols-[60px_minmax(120px,1.2fr)_minmax(90px,0.8fr)_minmax(110px,0.9fr)_minmax(100px,0.8fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(150px,auto)]";

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTimeLabel(iso: string | null) {
    if (!iso) return "-";
    const d = new Date(iso);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yy}.${mm}.${dd} ${hh}:${min}`;
}

function formatPhone(phone: string) {
    if (phone.length === 11) return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    if (phone.length === 10) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    return phone;
}

// 관리자 예약 취소 관리 - 취소 신청(취소 대기) 목록을 확인하고 승인 처리 (승인 시 환불 진행중으로 전환)
export default function AdminCancellationListView() {
    const [items, setItems] = useState<AdminReservationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/reservation/cancellations");
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "목록을 불러오지 못했습니다.");
            setItems(result.data ?? []);
        } catch (err: any) {
            setError(err.message || "서버 내부 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            setProcessingId(id);
            const res = await fetch(`/api/admin/reservation/${id}/cancel`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "처리에 실패했습니다.");
            await load();
        } catch (err: any) {
            setError(err.message || "서버 내부 오류가 발생했습니다.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-title">예약 취소 관리</h2>
            </div>

            {error && <p className="px-5 py-3 text-sm text-red-500">{error}</p>}

            {loading && <p className="px-5 py-8 text-center text-sm text-muted">정보를 불러오는 중입니다.</p>}

            {!loading && items.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-muted">취소 신청된 예약이 없습니다.</p>
            )}

            {!loading && items.length > 0 && (
                <div className={`grid ${GRID_COLS}`}>
                    <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">{UNIT_LABEL}</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">예약자</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">연락처</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">기간</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">신청일시</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">상태</span>
                    <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">처리</span>

                    {items.map((r, index) => (
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
                                {formatDateTimeLabel(r.cancelRequestedAt)}
                            </span>
                            <div className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5">
                                <span className={`badge ${ADMIN_STATUS_BADGE_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 border-b border-gray-100 px-5 py-3.5">
                                {r.status === "cancel_requested" ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleAction(r.id, "approve")}
                                            disabled={processingId === r.id}
                                            className="btn-primary px-4 py-1.5 text-xs"
                                        >
                                            {processingId === r.id ? "처리 중..." : "승인"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAction(r.id, "reject")}
                                            disabled={processingId === r.id}
                                            className="btn-danger px-4 py-1.5 text-xs"
                                        >
                                            반려
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted">-</span>
                                )}
                            </div>
                        </Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
