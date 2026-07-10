// 관리자 실시간 예약 달력 - 월별(및 전후 1개월) 예약 목록 조회
// table: bookings
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDateISO } from '@/lib/reservationDate';
import { ADMIN_BOOKING_SELECT, mapAdminReservationRow } from '@/lib/adminReservation';

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function GET(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get('year'));
    const monthParam = Number(searchParams.get('month')); // 1-indexed

    if (!Number.isInteger(year) || !Number.isInteger(monthParam) || monthParam < 1 || monthParam > 12) {
        return NextResponse.json({ error: 'year, month 파라미터가 올바르지 않습니다.' }, { status: 400 });
    }

    const monthIndex = monthParam - 1;

    // 달력 첫/마지막 주가 전/다음 달로 걸치는 경우까지 놓치지 않도록 전후 1개월씩 넉넉하게 조회
    const rangeStartDate = new Date(year, monthIndex - 1, 1);
    const rangeEndDate = new Date(year, monthIndex + 2, 1);
    const rangeStart = formatDateISO(rangeStartDate.getFullYear(), rangeStartDate.getMonth(), rangeStartDate.getDate());
    const rangeEnd = formatDateISO(rangeEndDate.getFullYear(), rangeEndDate.getMonth(), rangeEndDate.getDate());

    const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(ADMIN_BOOKING_SELECT)
        .neq('status', 'cancelled')
        .lt('check_in', rangeEnd)
        .gt('check_out', rangeStart)
        .order('check_in', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: (data ?? []).map(mapAdminReservationRow) });
}
