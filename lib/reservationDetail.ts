import { resolveReservationStatus, ReservationStatus } from "./reservationStatus";

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
    status: ReservationStatus;
    created_at: string;
}

export const BOOKING_DETAIL_SELECT =
    'id, status, check_in, check_out, extra_people, options, total_price, name, phone, check_status, cancel_status, created_at, rooms(name)';

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
        status: resolveReservationStatus(row.status, row.check_status, row.cancel_status),
        created_at: row.created_at,
    };
}
