// 비회원 예약 조회 - 연락처로 검색 (로그인 불필요)
// table: bookings
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BOOKING_DETAIL_SELECT, mapBookingRow } from '@/lib/reservationDetail';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') ?? '';

    if (!/^[0-9]{10,11}$/.test(phone)) {
        return NextResponse.json({ error: '연락처를 숫자만 10~11자리로 입력해 주세요.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(BOOKING_DETAIL_SELECT)
        .eq('phone', phone)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: (data ?? []).map(mapBookingRow) });
}
