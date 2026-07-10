// 객실 전체 조회 / 등록
// table: rooms
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'room-images';
const ADMIN_SESSION_VALUE = 'is_authenticated_true_secret_key';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === ADMIN_SESSION_VALUE;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('rooms')
            .select('id, name, base_price, base_people, max_people, extra_person_price, quantity, description, image_url, created_at')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return NextResponse.json({ data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const base_price = formData.get('base_price');
        const base_people = formData.get('base_people');
        const max_people = formData.get('max_people');
        const extra_person_price = formData.get('extra_person_price');
        const quantity = formData.get('quantity');
        const description = formData.get('description');
        const file = formData.get('file');

        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: '객실 이름을 입력해 주세요.' }, { status: 400 });
        }
        if (!base_price || Number(base_price) <= 0) {
            return NextResponse.json({ error: '1박당 가격을 입력해 주세요.' }, { status: 400 });
        }
        if (!base_people || Number(base_people) <= 0) {
            return NextResponse.json({ error: '기준 인원을 입력해 주세요.' }, { status: 400 });
        }
        if (!max_people || Number(max_people) < Number(base_people)) {
            return NextResponse.json({ error: '최대 인원은 기준 인원 이상이어야 합니다.' }, { status: 400 });
        }
        if (!quantity || Number(quantity) <= 0) {
            return NextResponse.json({ error: '객실 개수를 입력해 주세요.' }, { status: 400 });
        }

        let imageUrl: string | null = null;

        if (file instanceof File && file.size > 0) {
            const path = `rooms/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabaseAdmin
            .from('rooms')
            .insert({
                name,
                base_price: Number(base_price),
                base_people: Number(base_people),
                max_people: Number(max_people),
                extra_person_price: Number(extra_person_price) || 0,
                quantity: Number(quantity),
                description: typeof description === 'string' && description.trim() ? description : null,
                image_url: imageUrl,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
