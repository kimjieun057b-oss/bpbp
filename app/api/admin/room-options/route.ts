// 부가서비스 전체 조회 / 등록
// table: room_options
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
        .from('room_options')
        .select('id, label, price, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const { label, price } = await request.json();

        if (typeof label !== 'string' || !label.trim()) {
            return NextResponse.json({ error: '부가서비스명을 입력해 주세요.' }, { status: 400 });
        }
        if (price === undefined || price === null || Number(price) < 0) {
            return NextResponse.json({ error: '가격을 입력해 주세요.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('room_options')
            .insert({ label: label.trim(), price: Number(price) })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
