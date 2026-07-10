import InquireBoardForm from "@/components/form/InquireBoardForm";
import InquireBoardUserForm from "@/components/form/InquireBoardUserForm";

export default function InquireWritePage () {
    return (
        <article>
            <div>
                <div>
                    {/* <h2>문의하기</h2> */}
                </div>
                {/* 비회원/회원 폼 */}
                <InquireBoardUserForm/>
                {/* 로그인 무관 폼 */}
                {/* <InquireBoardForm/> */}
            </div>
        </article>
    )
}