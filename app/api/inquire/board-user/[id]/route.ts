// 문의 상세 조회/수정/삭제 - 회원 인지 가능 (본인 글이면 비밀번호 없이 조회/수정/삭제 가능)
// table: inquire_board
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'board-files';
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

export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const password = request.headers.get('X-Password');
        const requestUserId = request.headers.get('X-User-Id');
        const admin = await isAdmin();

        const { data, error } = await supabaseAdmin
            .from('inquire_board')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 로그인한 회원 본인이 작성한 글이면 비밀글이어도 비밀번호 없이 조회 가능
        const isOwner = !!data.user_id && !!requestUserId && data.user_id === requestUserId;

        if (data.privacy && !admin && !isOwner) {

            // 최초 진입 시 비밀번호를 아예 안 보내준 경우
            if (!password) {
                return NextResponse.json({
                    success: false,
                    error: "REQUIRED_PASSWORD",
                    message: "비밀번호 입력이 필요한 비밀글입니다."
                }, { status: 200 });
            }

            const inputHash = crypto.createHash("sha256").update(password).digest("hex");
            if (inputHash !== data.password_hash) {
                return NextResponse.json({
                    success: false,
                    error: "INVALID_PASSWORD",
                    message: "비밀번호가 일치하지 않습니다."
                }, { status: 401 });
            }
        }

        const { password_hash, ...safeData } = data;
        return NextResponse.json({ data: safeData });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const admin = await isAdmin();
        const formData = await request.formData();
        const password = formData.get('password');
        const bypassUserId = formData.get('user_id');

        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('inquire_board')
            .select('password_hash, file_url, user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 로그인한 회원 본인이 작성한 글이면 비밀번호 검증 없이 수정 가능
        const isOwner = !!existing.user_id && typeof bypassUserId === 'string' && bypassUserId === existing.user_id;

        if (!admin && !isOwner) {
            if (typeof password !== 'string' || !password.trim()) {
                return NextResponse.json({ error: '비밀번호를 입력해 주세요.' }, { status: 400 });
            }

            const inputHash = crypto.createHash('sha256').update(password).digest('hex');
            if (inputHash !== existing.password_hash) {
                return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
            }
        }

        const category = formData.get('category');
        const name = formData.get('name');
        const mail_id = formData.get('mail_id');
        const mail_address = formData.get('mail_address');
        const title = formData.get('title');
        const contents = formData.get('contents');
        const privacy = formData.get('privacy');
        const file = formData.get('file');

        const updatePayload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof category === 'string' && category.trim()) updatePayload.category = category;
        if (typeof name === 'string' && name.trim()) updatePayload.name = name;
        if (typeof mail_id === 'string' && mail_id.trim()) updatePayload.mail_id = mail_id;
        if (typeof mail_address === 'string' && mail_address.trim()) updatePayload.mail_address = mail_address;
        if (typeof title === 'string' && title.trim()) updatePayload.title = title;
        if (typeof contents === 'string' && contents.trim()) updatePayload.contents = contents;
        if (privacy !== null) updatePayload.privacy = privacy === 'true';

        if (file instanceof Blob && file.size > 0) {
            if (existing.file_url) {
                const oldPath = extractStoragePath(existing.file_url, BUCKET);
                if (oldPath) await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
            }

            const fileName = file instanceof File ? file.name : `attachment_${Date.now()}`;
            const path = `inquire/${Date.now()}_${fileName}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type });

            if (uploadError) throw new Error(uploadError.message);

            const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
            updatePayload.file_url = publicUrlData.publicUrl;
        }

        const { data, error } = await supabaseAdmin
            .from('inquire_board')
            .update(updatePayload)
            .eq('id', id)
            .select('id, category, name, title, privacy, file_url, created_at, updated_at, user_id')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const admin = await isAdmin();

        const { data: existing } = await supabaseAdmin
            .from('inquire_board')
            .select('password_hash, file_url, user_id')
            .eq('id', id)
            .single();

        if (!admin) {
            const body = await request.json().catch(() => ({}));

            // 로그인한 회원 본인이 작성한 글이면 비밀번호 검증 없이 삭제 가능
            const isOwner = !!existing?.user_id && body.userId && existing.user_id === body.userId;

            if (!isOwner) {
                const password = body.password ?? null;

                if (!password) {
                    return NextResponse.json({ error: '비밀번호를 입력해 주세요.' }, { status: 400 });
                }

                if (!existing) {
                    return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
                }

                const inputHash = crypto.createHash('sha256').update(password).digest('hex');
                if (inputHash !== existing.password_hash) {
                    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
                }
            }
        }

        const { error } = await supabaseAdmin
            .from('inquire_board')
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
