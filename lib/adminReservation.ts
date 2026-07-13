import { resolveReservationStatus, ReservationStatus } from "./reservationStatus";

export interface AdminReservationItem {
    id: string;
    roomName: string;
    guestName: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    people: number;
    status: ReservationStatus;
    createdAt: string;
    cancelRequestedAt: string | null;
}

export const ADMIN_BOOKING_SELECT =
    'id, status, check_in, check_out, extra_people, name, phone, check_status, cancel_status, cancel_requested_at, created_at, rooms(name, base_people)';

export function mapAdminReservationRow(row: any): AdminReservationItem {
    return {
        id: row.id,
        roomName: row.rooms?.name ?? '알 수 없음',
        guestName: row.name,
        phone: row.phone,
        checkIn: row.check_in,
        checkOut: row.check_out,
        people: (row.rooms?.base_people ?? 0) + (row.extra_people ?? 0),
        status: resolveReservationStatus(row.status, row.check_status, row.cancel_status),
        createdAt: row.created_at,
        cancelRequestedAt: row.cancel_requested_at ?? null,
    };
}
