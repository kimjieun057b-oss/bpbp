// 예약 시 선택 가능한 부가서비스 목록 조회 - 비회원용 공개 API
// table: room_options
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('room_options')
        .select('id, label, price')
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
