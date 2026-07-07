// 간편 문의 답변 상태 수동 변경
// table: inquire_quick
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

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
        const { is_answered } = await request.json();

        if (typeof is_answered !== 'boolean') {
            return NextResponse.json({ error: 'is_answered 값이 필요합니다.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('inquire_quick')
            .update({ is_answered })
            .eq('id', id)
            .select('id, is_answered')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
