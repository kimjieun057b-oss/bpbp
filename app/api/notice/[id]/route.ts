// 공지사항 상세 조회/수정/삭제
// table: notice
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'board-files';

type Params = { params: Promise<{ id: string }> };

function extractStoragePath(url: string, bucket: string): string | null {
    const marker = `/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
}

export async function GET(_request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('notice')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get('title');
        const contents = formData.get('contents');
        const file = formData.get('file');

        const { data: existing } = await supabaseAdmin
            .from('notice')
            .select('file_url')
            .eq('id', id)
            .single();

        const updatePayload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof title === 'string' && title.trim()) updatePayload.title = title;
        if (typeof contents === 'string' && contents.trim()) updatePayload.contents = contents;

        if (file instanceof Blob && file.size > 0) {
            if (existing?.file_url) {
                const oldPath = extractStoragePath(existing.file_url, BUCKET);
                if (oldPath) await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
            }

            const fileName = file instanceof File ? file.name : `attachment_${Date.now()}`;
            const path = `notice/${Date.now()}_${fileName}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
            updatePayload.file_url = publicUrlData.publicUrl;
        }

        const { data, error } = await supabaseAdmin
            .from('notice')
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
    try {
        const { id } = await params;

        const { data: existing } = await supabaseAdmin
            .from('notice')
            .select('file_url')
            .eq('id', id)
            .single();

        const { error } = await supabaseAdmin
            .from('notice')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);

        if (existing?.file_url) {
            const oldPath = extractStoragePath(existing.file_url, BUCKET);
            if (oldPath) await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
