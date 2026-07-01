import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SERVICE_ROLE_KEY를 사용해야 유저 삭제 권한이 생김
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'board-files';

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// 회원탈퇴
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: '유저 ID가 필요합니다.' }, { status: 400 });
    }

    // inquire_board.user_id에 DB 차원의 ON DELETE CASCADE가 걸려있는지 보장할 수 없으므로,
    // Auth 유저를 지우기 전에 본인이 작성한 문의글/댓글/첨부파일을 앱 레벨에서 먼저 정리한다.
    const { data: myPosts, error: fetchError } = await supabaseAdmin
      .from('inquire_board')
      .select('id, file_url')
      .eq('user_id', userId);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (myPosts && myPosts.length > 0) {
      const postIds = myPosts.map((p) => p.id);

      const { error: commentError } = await supabaseAdmin
        .from('comment')
        .delete()
        .in('inquire_id', postIds);

      if (commentError) {
        return NextResponse.json({ error: commentError.message }, { status: 400 });
      }

      const filePaths = myPosts
        .map((p) => p.file_url && extractStoragePath(p.file_url, BUCKET))
        .filter((path): path is string => !!path);

      if (filePaths.length > 0) {
        await supabaseAdmin.storage.from(BUCKET).remove(filePaths);
      }

      const { error: deletePostsError } = await supabaseAdmin
        .from('inquire_board')
        .delete()
        .in('id', postIds);

      if (deletePostsError) {
        return NextResponse.json({ error: deletePostsError.message }, { status: 400 });
      }
    }

    // Supabase Auth에서 유저 삭제
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
  } catch (err) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}