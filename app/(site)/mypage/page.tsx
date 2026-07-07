import Link from "next/link";
import MyInquireList from "@/components/board/user/MyInquireList";
import MyReservationList from "@/components/reservation/MyReservationList";

export default function Mypage() {
  return (
    <article>
      <div>
        <h2>mp</h2>
        <div className="space-y-6">
          <MyInquireList />
          <MyReservationList />
        </div>
        <div className="flex gap-3 mt-6">
          <Link href="/mypage/withdraw" className="btn-danger">탈퇴</Link>
          <Link href="/mypage/edit" className="btn-ghost">회원정보 수정</Link>
        </div>
      </div>
    </article>
  );
}
