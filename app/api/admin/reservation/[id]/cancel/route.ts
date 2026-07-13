// 관리자 예약 취소 승인/반려 - 취소 대기(requested) 상태만 처리 가능
// 승인: 예약을 취소 처리하여 자리 확보 (환불 진행중으로 전환)
// 반려: 취소 신청 자체를 취소하고 예약을 원래 상태로 복구
// table: bookings
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

type Params = { params: Promise<{ id: string }> };
type Action = 'approve' | 'reject';

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
        const { action } = (await request.json()) as { action?: Action };

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'action 값이 올바르지 않습니다.' }, { status: 400 });
        }

        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('id, cancel_status')
            .eq('id', id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
        }

        if (booking.cancel_status !== 'requested') {
            return NextResponse.json({ error: '취소 대기 중인 예약만 처리할 수 있습니다.' }, { status: 400 });
        }

        const update =
            action === 'approve'
                ? { cancel_status: 'approved', status: 'cancelled' }
                : { cancel_status: null, cancel_requested_at: null };

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update(update)
            .eq('id', id)
            .select('id, cancel_status, status')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '처리에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
