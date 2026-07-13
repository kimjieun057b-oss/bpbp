// 예약 취소 신청 - 체크인 3일 전까지, 본인 확인(연락처 또는 user_id) 후 신청 (관리자 승인 필요)
// table: bookings
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveReservationStatus, isCancellable } from '@/lib/reservationStatus';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const { phone, user_id: userId } = await request.json();

        if (!phone && !userId) {
            return NextResponse.json({ error: '본인 확인 정보가 필요합니다.' }, { status: 400 });
        }

        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('id, status, check_in, check_status, cancel_status, phone, user_id')
            .eq('id', id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
        }

        const isOwner = userId ? booking.user_id === userId : booking.phone === phone;
        if (!isOwner) {
            return NextResponse.json({ error: '본인 예약만 취소 신청할 수 있습니다.' }, { status: 403 });
        }

        const status = resolveReservationStatus(booking.status, booking.check_status, booking.cancel_status);
        if (!isCancellable(status, booking.check_in)) {
            return NextResponse.json(
                { error: '체크인 3일 전까지, 취소 신청 중이 아닌 예약만 취소할 수 있습니다.' },
                { status: 400 },
            );
        }

        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ cancel_status: 'requested', cancel_requested_at: new Date().toISOString() })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json({ error: '취소 신청에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
