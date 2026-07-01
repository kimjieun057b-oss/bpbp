// 이전/다음 공지사항 조회
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const numId = Number(id);

        const [{ data: prev }, { data: next }] = await Promise.all([
            supabaseAdmin
                .from('notice')
                .select('id, title')
                .lt('id', numId)
                .order('id', { ascending: false })
                .limit(1)
                .single(),
            supabaseAdmin
                .from('notice')
                .select('id, title')
                .gt('id', numId)
                .order('id', { ascending: true })
                .limit(1)
                .single(),
        ]);

        return NextResponse.json({ prev: prev ?? null, next: next ?? null });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
