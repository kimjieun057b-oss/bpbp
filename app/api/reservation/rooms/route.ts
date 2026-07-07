// 예약 가능한 객실/사이트 목록 조회 - 비회원용 공개 API
// table: rooms
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('rooms')
        .select('id, name, base_price, base_people, max_people, extra_person_price')
        .order('base_price', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
