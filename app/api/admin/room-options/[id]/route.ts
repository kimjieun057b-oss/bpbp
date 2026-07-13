// 부가서비스 상세 조회 / 수정 / 삭제
// table: room_options
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

type Params = { params: Promise<{ id: string }> };

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function GET(_request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from('room_options')
        .select('id, label, price, created_at')
        .eq('id', id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: '부가서비스를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const { label, price } = await request.json();

        const updatePayload: Record<string, any> = {};
        if (typeof label === 'string' && label.trim()) updatePayload.label = label.trim();
        if (price !== undefined && price !== null && Number(price) >= 0) updatePayload.price = Number(price);

        const { data, error } = await supabaseAdmin
            .from('room_options')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
        .from('room_options')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
