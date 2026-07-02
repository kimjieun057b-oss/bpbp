import InquireBoardList from "@/components/board/InquireBoardList";
import Link from "next/link";

export default function InquireBoardPage () {
    return (
        <article>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2>문의게시판</h2>
                    <Link href="/inquire/write" className="btn-primary">문의하기</Link>
                </div>
                <InquireBoardList/>
            </div>
        </article>
    )
}