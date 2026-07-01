// 댓글 삭제 (관리자 전용)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ commentId: string }> };

const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session')?.value;
        if (session !== ADMIN_SESSION_VALUE) {
            return NextResponse.json({ error: '관리자만 삭제할 수 있습니다.' }, { status: 403 });
        }

        const { commentId } = await params;
        const { error } = await supabaseAdmin
            .from('comment')
            .delete()
            .eq('id', Number(commentId));

        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
