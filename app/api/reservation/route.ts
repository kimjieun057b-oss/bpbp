// 예약 등록 - 객실은 quantity(동일 타입 객실 개수)만큼 동시 예약이 가능하므로,
// 겹치는 기간의 확정 예약 수를 세어 quantity를 넘지 않는지 확인한다.
// table: bookings
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcNights } from '@/lib/reservationDate';
import { createReservationEvent } from '@/lib/googleCalendar/reservationEvents';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { room_id, check_in, check_out, extra_people, options, name, phone, user_id } = body;

        if (typeof room_id !== 'string' || !room_id) {
            return NextResponse.json({ error: '객실을 선택해 주세요.' }, { status: 400 });
        }
        if (typeof check_in !== 'string' || !DATE_RE.test(check_in) || typeof check_out !== 'string' || !DATE_RE.test(check_out)) {
            return NextResponse.json({ error: '체크인/체크아웃 날짜가 올바르지 않습니다.' }, { status: 400 });
        }
        if (check_out <= check_in) {
            return NextResponse.json({ error: '체크아웃 날짜는 체크인 날짜 이후여야 합니다.' }, { status: 400 });
        }
        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 });
        }
        if (typeof phone !== 'string' || !/^[0-9]{10,11}$/.test(phone)) {
            return NextResponse.json({ error: '연락처를 숫자만 10~11자리로 입력해 주세요.' }, { status: 400 });
        }
        if (user_id !== undefined && user_id !== null && typeof user_id !== 'string') {
            return NextResponse.json({ error: 'user_id 값이 올바르지 않습니다.' }, { status: 400 });
        }

        const extraPeople = Number(extra_people) || 0;
        if (extraPeople < 0 || !Number.isInteger(extraPeople)) {
            return NextResponse.json({ error: '인원 수가 올바르지 않습니다.' }, { status: 400 });
        }

        const requestedOptionIds: string[] = Array.isArray(options) ? options : [];

        // 부가서비스도 가격과 마찬가지로 클라이언트 값을 신뢰하지 않고 DB에 실제 존재하는 항목만 인정한다.
        const { data: optionRows, error: optionsError } = requestedOptionIds.length
            ? await supabaseAdmin.from('room_options').select('id, price').in('id', requestedOptionIds)
            : { data: [], error: null };

        if (optionsError) throw new Error(optionsError.message);

        const optionIds = (optionRows ?? []).map((o) => o.id);

        const { data: room, error: roomError } = await supabaseAdmin
            .from('rooms')
            .select('id, name, base_price, base_people, max_people, extra_person_price, quantity')
            .eq('id', room_id)
            .single();

        if (roomError || !room) {
            return NextResponse.json({ error: '존재하지 않는 객실입니다.' }, { status: 404 });
        }

        const maxExtraPeople = Math.max(0, room.max_people - room.base_people);
        if (extraPeople > maxExtraPeople) {
            return NextResponse.json({ error: '최대 인원을 초과했습니다.' }, { status: 400 });
        }

        // 같은 객실(room_id)이 quantity개 만큼 있으므로, 겹치는 기간에 확정된 예약 수가
        // quantity 미만일 때만 새 예약을 허용한다.
        const { count: overlappingCount, error: overlapError } = await supabaseAdmin
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('room_id', room_id)
            .neq('status', 'cancelled')
            .lt('check_in', check_out)
            .gt('check_out', check_in);

        if (overlapError) throw new Error(overlapError.message);

        if ((overlappingCount ?? 0) >= room.quantity) {
            return NextResponse.json({ error: '해당 기간에 예약 가능한 객실이 없습니다.' }, { status: 409 });
        }

        const nights = calcNights(check_in, check_out);

        // 가격은 클라이언트 값을 신뢰하지 않고 서버에서 재계산
        const roomPrice = room.base_price * nights;
        const extraPeopleFee = extraPeople * room.extra_person_price * nights;
        const optionsPrice = (optionRows ?? []).reduce((sum, o) => sum + o.price, 0);
        const totalPrice = roomPrice + extraPeopleFee + optionsPrice;

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .insert({
                room_id,
                check_in,
                check_out,
                extra_people: extraPeople,
                options: optionIds,
                name,
                phone,
                user_id: user_id || null,
                total_price: totalPrice,
                status: 'confirmed',
            })
            .select('id, check_in, check_out, total_price')
            .single();

        if (error) {
            // 예전 exclusion constraint(bookings_no_overlap)가 아직 남아있는 경우를 대비한 방어 처리
            if (error.code === '23P01') {
                return NextResponse.json({ error: '방금 다른 예약이 확정되어 해당 객실/기간은 예약할 수 없습니다.' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message || '예약에 실패했습니다.' }, { status: 400 });
        }

        try {
            // 신규 예약 = confirmed (구글 캘린더 연동)
            await createReservationEvent({
                reservationId: data.id,
                roomName: room.name,
                guestName: name,
                phone,
                checkIn: check_in,
                checkOut: check_out,
                extraPeople,
            });
        } catch (calendarError) {
            console.error('Google Calendar 이벤트 생성 실패:', calendarError);
        }

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
