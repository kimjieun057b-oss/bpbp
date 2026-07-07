// 로그인한 회원의 예약 목록 조회 (마이페이지)
// table: bookings
// 참고: app/api/inquire/board-user와 동일하게 클라이언트가 전달한 user_id를 신뢰하는 방식입니다.
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BOOKING_DETAIL_SELECT, mapBookingRow } from '@/lib/reservationDetail';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'user_id가 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(BOOKING_DETAIL_SELECT)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: (data ?? []).map(mapBookingRow) });
}
