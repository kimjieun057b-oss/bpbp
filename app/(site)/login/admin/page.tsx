import NomalLoginForm from "@/components/form/NomalLoginForm";
import Link from "next/link";

// 관리자 로그인 페이지
export default function AdminLoginPage () {
    return (
        <article>
            <div>
              <div>
                {/* <h2>ADMIN LOGIN</h2>
                <p>관리자 로그인</p> */}
              </div>
              <div>
                <NomalLoginForm/>
                <p className="text-center text-sm mt-4">
                  <Link href="/login" className="text-muted hover:text-primary">일반 로그인으로 돌아가기</Link>
                </p>
              </div>
            </div>
        </article>
    )
}
