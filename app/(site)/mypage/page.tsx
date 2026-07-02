import Link from "next/link";
import MyInquireList from "@/components/board/user/MyInquireList";

export default function Mypage() {
  return (
    <article>
      <div>
        <h2>mp</h2>
        <MyInquireList />
        <div className="flex gap-3 mt-6">
          <Link href="/mypage/withdraw" className="btn-danger">탈퇴</Link>
          <Link href="/mypage/edit" className="btn-ghost">회원정보 수정</Link>
        </div>
      </div>
    </article>
  );
}
