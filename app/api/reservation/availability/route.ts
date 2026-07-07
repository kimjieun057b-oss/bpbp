// 특정 월(및 전후 1개월)의 예약 현황 조회
// 달력 마감 표시 및 객실 가능여부 계산용
// table: bookings
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDateISO } from '@/lib/reservationDate';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get('year'));
    const monthParam = Number(searchParams.get('month')); // 1-indexed

    if (!Number.isInteger(year) || !Number.isInteger(monthParam) || monthParam < 1 || monthParam > 12) {
        return NextResponse.json({ error: 'year, month 파라미터가 올바르지 않습니다.' }, { status: 400 });
    }

    const monthIndex = monthParam - 1;

    // 월 경계를 넘어가는 예약(예: 이번달 30일 체크인 ~ 다음달 2일 체크아웃)까지 잡기 위해 전후 1개월씩 넉넉하게 조회
    const rangeStartDate = new Date(year, monthIndex - 1, 1);
    const rangeEndDate = new Date(year, monthIndex + 2, 1);
    const rangeStart = formatDateISO(rangeStartDate.getFullYear(), rangeStartDate.getMonth(), rangeStartDate.getDate());
    const rangeEnd = formatDateISO(rangeEndDate.getFullYear(), rangeEndDate.getMonth(), rangeEndDate.getDate());

    const { data, error } = await supabaseAdmin
        .from('bookings')
        .select('room_id, check_in, check_out')
        .neq('status', 'cancelled')
        .lt('check_in', rangeEnd)
        .gt('check_out', rangeStart);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
