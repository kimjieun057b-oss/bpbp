"use client";
import { useEffect, useState } from "react";
import Toast from "@/components/common/Toast";
import { AddonOption } from "@/lib/reservationOptions";
import { calcNights } from "@/lib/reservationDate";
import { ReservationDetail } from "@/lib/reservationDetail";
import { getDisplayStatus, isCancellable, CUSTOMER_STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/reservationStatus";

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface ReservationResultCardProps {
    booking: ReservationDetail;
    // 취소 신청 처리 함수 - 조회 방식(비회원 연락처 / 회원 user_id)에 따라 호출부에서 구현하여 주입
    onCancel?: () => void | Promise<void>;
}

// 예약 결과 상세 UI - 비회원 조회(/reservation/check)와 마이페이지 상세에서 공용으로 사용
export default function ReservationResultCard({ booking, onCancel }: ReservationResultCardProps) {
    const [confirmToast, setConfirmToast] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [options, setOptions] = useState<AddonOption[]>([]);

    useEffect(() => {
        fetch('/api/reservation/options')
            .then((res) => res.json())
            .then(({ data }) => setOptions(data ?? []))
            .catch(() => {});
    }, []);

    const nights = calcNights(booking.check_in, booking.check_out);
    const optionLabels = booking.options
        .map((id) => options.find((o) => o.id === id)?.label)
        .filter((label): label is NonNullable<typeof label> => Boolean(label));
    const displayStatus = getDisplayStatus(booking.status, booking.check_in);
    // 아직 취소 신청 전인 confirmed 예약이면 취소 가능 여부와 무관하게 안내 문구를 노출
    const showCancelNotice = Boolean(onCancel) && booking.status === "confirmed";
    const cancellable = showCancelNotice && isCancellable(booking.status, booking.check_in);

    const handleConfirmCancel = async () => {
        if (!onCancel) return;
        try {
            setCancelling(true);
            await onCancel();
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="card space-y-4 p-6 bg-white">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-title">{booking.room_name}</h4>
                <span className={`badge ${CUSTOMER_STATUS_BADGE_CLASS[displayStatus]}`}>{STATUS_LABEL[displayStatus]}</span>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-body">
                <div className="flex justify-between">
                    <span className="text-muted">기간</span>
                    <span>
                        {formatDateLabel(booking.check_in)} ~ {formatDateLabel(booking.check_out)} ({nights}박)
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted">추가 인원</span>
                    <span>{booking.extra_people}명</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted">부가 서비스</span>
                    <span>{optionLabels.length > 0 ? optionLabels.join(", ") : "없음"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted">예약자</span>
                    <span>
                        {booking.name} · {booking.phone}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted">예약일시</span>
                    <span>{formatDateLabel(booking.created_at)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-base font-semibold text-title">
                <span>합계</span>
                <span className="text-primary">{booking.total_price.toLocaleString()}원</span>
            </div>

            {showCancelNotice && (
                <div className="space-y-2 border-t border-gray-100 pt-4">
                    <p className="text-xs text-muted">예약 취소는 체크인 3일 전까지만 신청할 수 있습니다.</p>
                    {cancellable && (
                        <button
                            type="button"
                            onClick={() => setConfirmToast("정말 취소 신청하시겠습니까?")}
                            disabled={cancelling}
                            className="btn-danger"
                        >
                            {cancelling ? "처리 중..." : "예약 취소 신청"}
                        </button>
                    )}
                </div>
            )}

            <Toast vaild={confirmToast} setVaild={setConfirmToast} onConfirm={handleConfirmCancel} />
        </div>
    );
}
