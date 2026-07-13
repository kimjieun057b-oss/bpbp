// 관리자 예약 취소 관리 - 취소 신청/승인된 예약 목록 조회
// table: bookings
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ADMIN_BOOKING_SELECT, mapAdminReservationRow } from '@/lib/adminReservation';

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(ADMIN_BOOKING_SELECT)
        .not('cancel_status', 'is', null)
        .order('check_in', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: (data ?? []).map(mapAdminReservationRow) });
}
