import { ADDON_OPTIONS } from "@/lib/reservationOptions";
import { calcNights } from "@/lib/reservationDate";
import { ReservationDetail, STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/reservationDetail";

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// 예약 결과 상세 UI - 비회원 조회(/reservation/check)와 마이페이지 상세에서 공용으로 사용
export default function ReservationResultCard({ booking }: { booking: ReservationDetail }) {
    const nights = calcNights(booking.check_in, booking.check_out);
    const optionLabels = booking.options
        .map((id) => ADDON_OPTIONS.find((o) => o.id === id)?.label)
        .filter((label): label is NonNullable<typeof label> => Boolean(label));

    return (
        <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-title">{booking.room_name}</h4>
                <span className={`badge ${STATUS_BADGE_CLASS[booking.status]}`}>{STATUS_LABEL[booking.status]}</span>
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
        </div>
    );
}
