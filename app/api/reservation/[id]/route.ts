// 예약 상세 조회 (마이페이지 - 본인 예약만)
// table: bookings
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BOOKING_DETAIL_SELECT, mapBookingRow } from '@/lib/reservationDetail';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'user_id가 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(BOOKING_DETAIL_SELECT)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data: mapBookingRow(data) });
}
