import { todayISO } from "./reservationDate";

// 예약 상태 - 관리자(캘린더/리스트)와 고객(예약조회/마이페이지)이 공유하는 단일 기준
// confirmed(예약확정) -> checked_in(체크인) -> checked_out(체크아웃) 순으로 진행되며,
// cancelled(예약취소)는 booking.status가 'cancelled'일 때만 표시되는 별도 상태
// checkin_due(체크인 전)는 DB에 저장되는 값이 아니라, confirmed 상태에서 체크인 날짜가
// 도래했을 때 화면에서만 계산해서 보여주는 파생 상태 (getDisplayStatus 참고)
export type ReservationStatus = "confirmed" | "checkin_due" | "checked_in" | "checked_out" | "cancelled";

// 관리자가 직접 변경 가능한 상태만 (체크인 전/취소는 이 목록에서 제외 - 자동 계산되거나 별도 흐름)
export const EDITABLE_STATUSES: ReservationStatus[] = ["confirmed", "checked_in", "checked_out"];

// 필터 UI에서 사용하는 전체 표시 상태 (파생 상태인 체크인 전 포함)
export const ALL_DISPLAY_STATUSES: ReservationStatus[] = ["confirmed", "checkin_due", "checked_in", "checked_out", "cancelled"];

export const STATUS_LABEL: Record<ReservationStatus, string> = {
    confirmed: "예약 확정",
    checkin_due: "체크인 전",
    checked_in: "체크인 완료",
    checked_out: "체크아웃 완료",
    cancelled: "예약 취소",
};

// 관리자 화면 색상 - 예약확정(회색, 아직 조치할 것 없음)과 체크인 전(파랑, 오늘 처리 필요)을 뚜렷하게 구분
export const ADMIN_STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
    confirmed: "badge-muted",
    checkin_due: "badge-info",
    checked_in: "badge-warning",
    checked_out: "badge-success",
    cancelled: "badge-muted",
};

// 관리자 캘린더 바 색상 - 뱃지와 같은 색 계열을 유지하되, 선택 여부에 따라 옅은/진한 톤을 나눠 사용
export const ADMIN_STATUS_BAR_CLASS: Record<ReservationStatus, { base: string; selected: string }> = {
    confirmed: { base: "bg-gray-100 text-muted hover:bg-gray-200", selected: "bg-gray-500 text-white" },
    checkin_due: { base: "bg-primary/10 text-primary hover:bg-primary/20", selected: "bg-primary text-white" },
    checked_in: { base: "bg-amber-50 text-amber-600 hover:bg-amber-100", selected: "bg-amber-500 text-white" },
    checked_out: { base: "bg-green-50 text-green-600 hover:bg-green-100", selected: "bg-green-600 text-white" },
    cancelled: { base: "bg-gray-100 text-muted hover:bg-gray-200", selected: "bg-gray-500 text-white" },
};

// 고객 화면 색상 - 예약확정과 체크인 전을 굳이 구분하지 않고 동일한 파란색으로 유지 (라벨 텍스트로만 구분)
export const CUSTOMER_STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
    confirmed: "badge-info",
    checkin_due: "badge-info",
    checked_in: "badge-warning",
    checked_out: "badge-success",
    cancelled: "badge-muted",
};

// booking.status(confirmed/pending/cancelled) + check_status(confirmed/checked_in/checked_out)를
// 화면에 보여줄 단일 상태값으로 합성 (관리자 상태변경 버튼과 매칭되는 "원본" 값 - checkin_due는 포함하지 않음)
export function resolveReservationStatus(bookingStatus: string, checkStatus: string | null | undefined): ReservationStatus {
    if (bookingStatus === "cancelled") return "cancelled";
    if (checkStatus === "checked_in" || checkStatus === "checked_out") return checkStatus;
    return "confirmed";
}

// 뱃지/캘린더 바 등 "보여주기용"으로만 쓰는 상태 - confirmed인데 체크인 날짜가 이미 도래했으면
// checkin_due(체크인 전)로 승격해서 표시. 버튼 활성 상태 비교에는 resolveReservationStatus의
// 원본 값을 그대로 써야 하므로 이 함수는 렌더링 시점에만 사용한다.
export function getDisplayStatus(status: ReservationStatus, checkIn: string): ReservationStatus {
    if (status === "confirmed" && checkIn <= todayISO()) return "checkin_due";
    return status;
}
