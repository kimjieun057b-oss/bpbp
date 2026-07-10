import MailLoginForm from "@/components/form/MailLoginForm";
import Link from "next/link";

// 로그인 페이지
export default function LoginPage () {
    return (
        <article>
            <div>
              <div>
                {/* <h2>-</h2>
                <p>로그인</p> */}
              </div>
              <div>
                {/* 유저 이메일 */}
                <MailLoginForm/>
                <p className="text-center text-sm mt-4">
                  <Link href="/login/admin" className="text-muted hover:text-primary">관리자 로그인</Link>
                </p>
              </div>
            </div>
        </article>
    )
}