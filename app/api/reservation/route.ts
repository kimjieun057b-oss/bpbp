// 예약 등록 - 최종 정합성 검증은 DB의 exclusion constraint(bookings_no_overlap)가 담당
// table: bookings
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcNights } from '@/lib/reservationDate';
import { ADDON_OPTIONS, calcOptionsPrice } from '@/lib/reservationOptions';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_OPTION_IDS = new Set(ADDON_OPTIONS.map((o) => o.id));

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

        const optionIds: string[] = Array.isArray(options) ? options.filter((id) => VALID_OPTION_IDS.has(id)) : [];

        const { data: room, error: roomError } = await supabaseAdmin
            .from('rooms')
            .select('id, base_price, base_people, max_people, extra_person_price')
            .eq('id', room_id)
            .single();

        if (roomError || !room) {
            return NextResponse.json({ error: '존재하지 않는 객실입니다.' }, { status: 404 });
        }

        const maxExtraPeople = Math.max(0, room.max_people - room.base_people);
        if (extraPeople > maxExtraPeople) {
            return NextResponse.json({ error: '최대 인원을 초과했습니다.' }, { status: 400 });
        }

        const nights = calcNights(check_in, check_out);

        // 가격은 클라이언트 값을 신뢰하지 않고 서버에서 재계산
        const roomPrice = room.base_price * nights;
        const extraPeopleFee = extraPeople * room.extra_person_price * nights;
        const optionsPrice = calcOptionsPrice(optionIds);
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
            // bookings_no_overlap exclusion constraint 위반 (동시 예약 충돌)
            if (error.code === '23P01') {
                return NextResponse.json({ error: '방금 다른 예약이 확정되어 해당 객실/기간은 예약할 수 없습니다.' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message || '예약에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
