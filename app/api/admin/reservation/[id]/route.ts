// 예약 체크인/체크아웃 상태 변경
// table: bookings
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';
const VALID_CHECK_STATUSES = ['confirmed', 'checked_in', 'checked_out'];

type Params = { params: Promise<{ id: string }> };

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function PATCH(request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const { check_status } = await request.json();

        if (typeof check_status !== 'string' || !VALID_CHECK_STATUSES.includes(check_status)) {
            return NextResponse.json({ error: 'check_status 값이 올바르지 않습니다.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update({ check_status })
            .eq('id', id)
            .select('id, check_status')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
