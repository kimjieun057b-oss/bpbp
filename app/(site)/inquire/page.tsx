import InquireBoardList from "@/components/board/InquireBoardList";
import Link from "next/link";

export default function InquireBoardPage () {
    return (
        <article>
            <div>
                <div>
                    <h2>문의게시판</h2>
                </div>
                <InquireBoardList/>
                <button><Link href="/inquire/write">문의하기</Link></button>
            </div>
        </article>
    )
}