export interface ReservationDetail {
    id: string;
    room_name: string;
    check_in: string;
    check_out: string;
    extra_people: number;
    options: string[];
    total_price: number;
    name: string;
    phone: string;
    status: "confirmed" | "pending" | "cancelled";
    created_at: string;
}

export const STATUS_LABEL: Record<ReservationDetail["status"], string> = {
    confirmed: "예약 확정",
    pending: "확인 중",
    cancelled: "예약 취소",
};

export const STATUS_BADGE_CLASS: Record<ReservationDetail["status"], string> = {
    confirmed: "badge-success",
    pending: "badge-warning",
    cancelled: "badge-muted",
};

export const BOOKING_DETAIL_SELECT =
    'id, check_in, check_out, extra_people, options, total_price, name, phone, status, created_at, rooms(name)';

export function mapBookingRow(row: any): ReservationDetail {
    return {
        id: row.id,
        room_name: row.rooms?.name ?? '알 수 없음',
        check_in: row.check_in,
        check_out: row.check_out,
        extra_people: row.extra_people,
        options: row.options ?? [],
        total_price: row.total_price,
        name: row.name,
        phone: row.phone,
        status: row.status,
        created_at: row.created_at,
    };
}
