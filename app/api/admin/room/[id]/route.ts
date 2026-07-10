// 객실 상세 조회 / 수정 / 삭제
// table: rooms
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'room-images';
const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

type Params = { params: Promise<{ id: string }> };

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

function extractStoragePath(url: string, bucket: string): string | null {
    const marker = `/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
}

export async function GET(_request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('rooms')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '객실을 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const formData = await request.formData();
        const name = formData.get('name');
        const base_price = formData.get('base_price');
        const base_people = formData.get('base_people');
        const max_people = formData.get('max_people');
        const extra_person_price = formData.get('extra_person_price');
        const quantity = formData.get('quantity');
        const description = formData.get('description');
        const file = formData.get('file');

        const { data: existing } = await supabaseAdmin
            .from('rooms')
            .select('image_url')
            .eq('id', id)
            .single();

        const updatePayload: Record<string, any> = {};

        if (typeof name === 'string' && name.trim()) updatePayload.name = name;
        if (base_price && Number(base_price) > 0) updatePayload.base_price = Number(base_price);
        if (base_people && Number(base_people) > 0) updatePayload.base_people = Number(base_people);
        if (max_people && Number(max_people) > 0) updatePayload.max_people = Number(max_people);
        if (extra_person_price !== null && extra_person_price !== '') updatePayload.extra_person_price = Number(extra_person_price);
        if (quantity && Number(quantity) > 0) updatePayload.quantity = Number(quantity);
        if (typeof description === 'string') updatePayload.description = description.trim() || null;

        if (file instanceof Blob && file.size > 0) {
            if (existing?.image_url) {
                const oldPath = extractStoragePath(existing.image_url, BUCKET);
                if (oldPath) await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
            }

            const fileName = file instanceof File ? file.name : `room_${Date.now()}`;
            const path = `rooms/${Date.now()}_${fileName}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
            updatePayload.image_url = publicUrlData.publicUrl;
        }

        const { data, error } = await supabaseAdmin
            .from('rooms')
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

    try {
        const { id } = await params;

        const { data: existing } = await supabaseAdmin
            .from('rooms')
            .select('image_url')
            .eq('id', id)
            .single();

        const { error } = await supabaseAdmin
            .from('rooms')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);

        if (existing?.image_url) {
            const oldPath = extractStoragePath(existing.image_url, BUCKET);
            if (oldPath) await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
