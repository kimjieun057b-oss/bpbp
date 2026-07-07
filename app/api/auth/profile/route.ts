import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 회원정보 수정 - 이름 / 연락처 / 비밀번호 (마이페이지)
export async function PATCH(request: Request) {
  try {
    const { userId, name, password, phone } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: '유저 ID가 필요합니다.' }, { status: 400 });
    }

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedPassword = typeof password === 'string' ? password.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!trimmedName && !trimmedPassword && !trimmedPhone) {
      return NextResponse.json({ error: '변경할 이름, 연락처 또는 비밀번호를 입력해 주세요.' }, { status: 400 });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (trimmedPassword && !passwordRegex.test(trimmedPassword)) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 하며, 영문과 숫자를 모두 포함해야 합니다.' }, { status: 400 });
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (trimmedPhone && !phoneRegex.test(trimmedPhone)) {
      return NextResponse.json({ error: '연락처는 숫자만 10~11자리로 입력해 주세요.' }, { status: 400 });
    }

    if (trimmedName || trimmedPhone) {
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (getUserError || !userData?.user) {
        return NextResponse.json({ error: '유저 정보를 찾을 수 없습니다.' }, { status: 400 });
      }

      const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...userData.user.user_metadata,
          ...(trimmedName ? { name: trimmedName } : {}),
          ...(trimmedPhone ? { phone: trimmedPhone } : {}),
        },
      });
      if (metaError) {
        return NextResponse.json({ error: metaError.message }, { status: 400 });
      }

      if (trimmedName) {
        // 이미 작성한 문의글에 저장되어 있는 이름도 함께 갱신
        const { error: boardError } = await supabaseAdmin
          .from('inquire_board')
          .update({ name: trimmedName })
          .eq('user_id', userId);
        if (boardError) {
          return NextResponse.json({ error: boardError.message }, { status: 400 });
        }
      }
    }

    if (trimmedPassword) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: trimmedPassword,
      });
      if (passwordError) {
        return NextResponse.json({ error: passwordError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: '회원정보가 수정되었습니다.' });
  } catch (err) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
