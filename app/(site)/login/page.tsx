import MailLoginForm from "@/components/form/MailLoginForm";
import NomalLoginForm from "@/components/form/NomalLoginForm";

// 로그인 페이지
export default function LoginPage () {
    return (
        <article>
            <div>
              <div>
                <h2>LOGIN</h2>
                <p>로그인</p>
              </div>
              <div>
                {/* <NomalLoginForm/> */}
                <MailLoginForm/>
              </div>
            </div>
        </article>
    )
}