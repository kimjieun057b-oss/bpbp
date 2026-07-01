"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import MyInquireList from "@/components/board/user/MyInquireList";

export default function Mypage() {

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("유저 정보를 가져오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onClickWithdraw = useCallback(async () => {
    if (!userId) {
      alert("유저 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    }

    if (!window.confirm("정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) return;

    try {
      const response = await fetch('/api/auth/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        await supabase.auth.signOut();
        window.location.href = '/';
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
    }
  }, [userId]);

// ⚠️ 회원 탈퇴 구현 시 반드시 체크할 점: ON DELETE CASCADE or ON DELETE SET NULL 설정
// Supabase Auth에서 유저 계정(auth.users)을 삭제할 때, 내가 커스텀으로 만든 일반 테이블(예: profiles, posts, orders 등)에 유저 ID(user_id)가 이물질처럼 남아있으면 에러가 나거나 유령 데이터가 쌓이게 됩니다.

// 💡 ON DELETE CASCADE란?
// auth.users에서 유저 계정이 삭제되면, 해당 유저가 작성한 글, 프로필, 장바구니 등의 데이터도 데이터베이스가 알아서 연쇄적으로(줄줄이) 함께 삭제해 주는 안전장치입니다. 수동으로 다 지울 필요가 없어 외로움이나 복잡함을 줄여줍니다. (유저의 데이터 모두 삭제)

// 💡 ON DELETE SET NULL이란?
// auth.users에서 유저 계정이 삭제되면, 해당 유저가 작성한 글, 프로필, 장바구니 등의 데이터는 user_id를 NULL로 설정하여 연결을 끊어주는 방식입니다. 이는 데이터의 무결성을 유지하는 데 도움이 됩니다. (데이터 유지)

  return (
    <article>
      <div>
        <h2>내 문의 목록</h2>
        <MyInquireList />
        <button onClick={onClickWithdraw}>탈퇴</button>
        <button>비밀번호 재설정</button>
      </div>
    </article>
  );
}