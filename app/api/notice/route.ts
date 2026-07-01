// 공지사항 전체 조회 / 등록
// table: notice
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'board-files';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('notice')
            .select('id, title, file_url, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return NextResponse.json({ data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const contents = formData.get('contents');
        const file = formData.get('file');

        if (typeof title !== 'string' || !title.trim()) {
            return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
        }
        if (typeof contents !== 'string' || !contents.trim()) {
            return NextResponse.json({ error: '내용을 입력해 주세요.' }, { status: 400 });
        }

        let fileUrl: string | null = null;

        if (file instanceof File && file.size > 0) {
            const path = `notice/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
            fileUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabaseAdmin
            .from('notice')
            .insert({ title, contents, file_url: fileUrl })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
