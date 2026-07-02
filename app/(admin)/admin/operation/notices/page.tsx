import NoticeList from "@/components/board/NoticeList";
import Link from "next/link";

export default function AdminNoticeListPage() {
    return (
        <>
            <div className="flex justify-end mb-4">
                <Link href="/admin/operation/notices/write" className="btn-primary">등록</Link>
            </div>
            <NoticeList basePath="/admin/operation/notices" />
        </>
    );
}
