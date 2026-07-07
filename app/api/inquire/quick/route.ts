// 간편 문의 API - SMS + DB (현 코드는 DB저장만)

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
        .from('inquire_quick')
        .select('id, name, phone_front, phone_middle, phone_last, is_answered, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const phoneFront = formData.get('phoneFront');
        const phoneMiddle = formData.get('phoneMiddle');
        const phoneLast = formData.get('phoneLast');
        const privacy = formData.get('privacy');

        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 });
        }
        if (
            typeof phoneFront !== 'string' || !phoneFront.trim() ||
            typeof phoneMiddle !== 'string' || !phoneMiddle.trim() ||
            typeof phoneLast !== 'string' || !phoneLast.trim()
        ) {
            return NextResponse.json({ error: '연락처를 입력해 주세요.' }, { status: 400 });
        }
        if (privacy !== 'true') {
            return NextResponse.json({ error: '개인정보 수집 및 이용 동의를 해주세요.' }, { status: 400 });
        }

        const { error: insertError } = await supabaseAdmin
            .from('inquire_quick')
            .insert({
                name,
                phone_front: phoneFront,
                phone_middle: phoneMiddle,
                phone_last: phoneLast,
                privacy: privacy === 'true',
            });

        if (insertError) {
            console.error('간편 문의 기록 저장 에러:', insertError);
            return NextResponse.json({ error: '문의 등록에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
