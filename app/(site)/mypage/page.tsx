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
          <button>
            <Link href="/mypage/withdraw" className="btn-danger px-5 py-2.5 border border-red-50 font-medium">탈퇴</Link>
          </button>
          <button>
            <Link href="/mypage/edit" className="btn-ghost">회원정보 수정</Link>
          </button>
        </div>
      </div>
    </article>
  );
}
