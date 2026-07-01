// 미답변 문의 수 (SideMenu 뱃지용)
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        // 관리자 댓글이 달린 inquire_id 목록
        const { data: answeredRows, error: err1 } = await supabaseAdmin
            .from('comment')
            .select('inquire_id')
            .eq('is_admin', true);

        if (err1) throw new Error(err1.message);

        const answeredIds = [...new Set((answeredRows ?? []).map((r) => r.inquire_id))];

        // 미답변 문의 수 집계
        let query = supabaseAdmin
            .from('inquire_board')
            .select('*', { count: 'exact', head: true });

        if (answeredIds.length > 0) {
            query = query.not('id', 'in', `(${answeredIds.join(',')})`);
        }

        const { count, error: err2 } = await query;
        if (err2) throw new Error(err2.message);

        return NextResponse.json({ count: count ?? 0 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
