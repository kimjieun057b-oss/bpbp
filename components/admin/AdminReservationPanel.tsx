import { calcNights } from "@/lib/reservationDate";
import { AdminReservationItem } from "@/lib/adminReservation";
import { getDisplayStatus, ReservationStatus, ADMIN_STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/reservationStatus";
import ReservationStatusButtons from "./ReservationStatusButtons";

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}월 ${d.getDate()}일(${"일월화수목금토"[d.getDay()]})`;
}

interface AdminReservationPanelProps {
    // 캘린더가 주 경계 렌더링을 위해 전후 1개월 버퍼까지 포함해 넘겨주는 전체 목록.
    // 캘린더에서 클릭한 예약(인접 달 걸침 포함)을 항상 찾을 수 있도록 상세 조회에만 사용한다.
    reservations: AdminReservationItem[];
    // 정확히 이번 달에 걸치는 예약만 걸러진 목록 - "이번 달 예약" 리스트 렌더링용
    monthReservations: AdminReservationItem[];
    loading: boolean;
    selectedId: string | null;
    onSelectReservation: (id: string) => void;
    onBackToList: () => void;
    onChangeStatus: (id: string, status: ReservationStatus) => void;
}

export default function AdminReservationPanel({
    reservations,
    monthReservations,
    loading,
    selectedId,
    onSelectReservation,
    onBackToList,
    onChangeStatus,
}: AdminReservationPanelProps) {
    const selected = reservations.find((r) => r.id === selectedId) ?? null;

    return (
        <aside className="card lg:w-96 lg:shrink-0">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-title">
                    {selected ? "예약 상세" : "이번 달 예약"}
                </h2>
                {selected && (
                    <button type="button" onClick={onBackToList} className="text-xs text-primary hover:underline">
                        ‹ 목록으로
                    </button>
                )}
            </div>

            {!selected && loading && (
                <p className="px-5 py-8 text-center text-sm text-muted">정보를 불러오는 중입니다.</p>
            )}

            {!selected && !loading && (
                <ul className="divide-y divide-gray-100">
                    {monthReservations
                        .slice()
                        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
                        .map((r) => {
                            const displayStatus = getDisplayStatus(r.status, r.checkIn);
                            return (
                                <li key={r.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectReservation(r.id)}
                                        className="flex w-full flex-col gap-1.5 px-5 py-3.5 text-left transition-colors hover:bg-surface"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="truncate text-sm text-title">{r.roomName}</span>
                                            <span className={`badge ${ADMIN_STATUS_BADGE_CLASS[displayStatus]}`}>{STATUS_LABEL[displayStatus]}</span>
                                        </div>
                                        <span className="text-xs text-muted">
                                            {formatDateLabel(r.checkIn)} ~ {formatDateLabel(r.checkOut)} · {r.guestName} · {r.people}인
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    {monthReservations.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-muted">이번 달 예약이 없습니다.</li>
                    )}
                </ul>
            )}

            {selected && (
                <div className="space-y-4 px-5 py-5">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-title">{selected.roomName}</h4>
                        <span className={`badge ${ADMIN_STATUS_BADGE_CLASS[getDisplayStatus(selected.status, selected.checkIn)]}`}>
                            {STATUS_LABEL[getDisplayStatus(selected.status, selected.checkIn)]}
                        </span>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-body">
                        <div className="flex justify-between">
                            <span className="text-muted">기간</span>
                            <span>
                                {formatDateLabel(selected.checkIn)} ~ {formatDateLabel(selected.checkOut)} (
                                {calcNights(selected.checkIn, selected.checkOut)}박)
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">체크인</span>
                            <span>{formatDateLabel(selected.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">체크아웃</span>
                            <span>{formatDateLabel(selected.checkOut)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">인원</span>
                            <span>{selected.people}인</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">예약자</span>
                            <span>
                                {selected.guestName} · {selected.phone}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                        <span className="form-label">예약확정/체크인/체크아웃 상태 변경</span>
                        <ReservationStatusButtons
                            status={selected.status}
                            onChange={(status) => onChangeStatus(selected.id, status)}
                        />
                    </div>
                </div>
            )}
        </aside>
    );
}
