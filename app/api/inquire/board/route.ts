// 문의 목록 조회 / 등록 - 비회원용 (로그인 여부와 무관하게 항상 비밀번호로 조회/수정/삭제)
// table: inquire_board
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'board-files';

export async function GET() {
    try {
        const { data: posts, error } = await supabaseAdmin
            .from('inquire_board')
            .select('id, category, name, title, privacy, created_at')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        const postIds = (posts ?? []).map((p) => p.id);

        const statsMap = new Map<number, { count: number; is_answered: boolean }>();
        if (postIds.length > 0) {
            const { data: comments, error: commentError } = await supabaseAdmin
                .from('comment')
                .select('inquire_id, is_admin')
                .in('inquire_id', postIds);

            if (commentError) throw new Error(commentError.message);

            for (const c of comments ?? []) {
                const s = statsMap.get(c.inquire_id) ?? { count: 0, is_answered: false };
                s.count++;
                if (c.is_admin) s.is_answered = true;
                statsMap.set(c.inquire_id, s);
            }
        }

        const data = (posts ?? []).map((post) => ({
            ...post,
            comment_count: statsMap.get(post.id)?.count ?? 0,
            is_answered: statsMap.get(post.id)?.is_answered ?? false,
        }));

        return NextResponse.json({ data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const category = formData.get('category');
        const name = formData.get('name');
        const mail_id = formData.get('mail_id');
        const mail_address = formData.get('mail_address');
        const title = formData.get('title');
        const contents = formData.get('contents');
        const privacy = formData.get('privacy');
        const password_hash = formData.get('password_hash');
        const file = formData.get('file');

        if (typeof category !== 'string' || !category.trim()) {
            return NextResponse.json({ error: '분류를 선택해 주세요.' }, { status: 400 });
        }
        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 });
        }
        if (typeof mail_id !== 'string' || !mail_id.trim() || typeof mail_address !== 'string' || !mail_address.trim()) {
            return NextResponse.json({ error: '이메일을 입력해 주세요.' }, { status: 400 });
        }
        if (typeof title !== 'string' || !title.trim()) {
            return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
        }
        if (typeof contents !== 'string' || !contents.trim()) {
            return NextResponse.json({ error: '내용을 입력해 주세요.' }, { status: 400 });
        }
        if (typeof password_hash !== 'string' || !password_hash.trim()) {
            return NextResponse.json({ error: '비밀번호를 입력해 주세요.' }, { status: 400 });
        }

        let fileUrl: string | null = null;
        if (file instanceof File && file.size > 0) {
            const path = `inquire/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
            fileUrl = publicUrlData.publicUrl;
        }

        const hashedPassword = crypto.createHash('sha256').update(password_hash).digest('hex');

        const { data, error } = await supabaseAdmin
            .from('inquire_board')
            .insert({
                category,
                name,
                mail_id,
                mail_address,
                title,
                contents,
                privacy: privacy === 'true',
                password_hash: hashedPassword,
                file_url: fileUrl,
            })
            .select('id, category, name, title, privacy, created_at')
            .single();

        if (error || !data) throw new Error(error?.message || '등록에 실패했습니다.');

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
