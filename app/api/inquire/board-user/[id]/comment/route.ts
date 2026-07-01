// 댓글 목록 조회 / 등록
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ id: string }> };

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

export async function GET(_req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin
            .from('comment')
            .select('id, comment, is_admin, created_at')
            .eq('inquire_id', Number(id))
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { comment } = body;

        if (typeof comment !== 'string' || !comment.trim()) {
            return NextResponse.json({ error: '댓글을 입력해주세요.' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session')?.value;
        const is_admin = session === ADMIN_SESSION_VALUE;

        const { data, error } = await supabaseAdmin
            .from('comment')
            .insert({ inquire_id: Number(id), comment: comment.trim(), is_admin })
            .select('id, comment, is_admin, created_at')
            .single();

        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
