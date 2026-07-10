"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "../common/Pagination";

interface NoticeBoardItem {
    id: number;
    title: string;
    created_at: string;
}

const ITEMS_PER_PAGE = 8;
const GRID_COLS = "grid-cols-[60px_minmax(200px,1fr)_minmax(100px,0.5fr)]";

interface NoticeListProps {
    basePath?: string;
}

export default function NoticeList({ basePath = '/notice' }: NoticeListProps) {
    const [notice, setnotice] = useState<NoticeBoardItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { currentItems, currentPage, totalCount, onPageChange } = usePagination(notice, ITEMS_PER_PAGE);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/notice');
                const { data } = await res.json();
                setnotice(data ?? []);
            } catch (err: any) {
                console.error("Fail data load...", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (notice.length === 0) return <div className="loading">게시글이 존재하지 않습니다.</div>;

    return (
        <>
            <div className={`card grid ${GRID_COLS} min-h-40`}>
                <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">제목</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">작성일</span>

                {currentItems.map((item, index) => (
                    <Link key={item.id} href={`${basePath}/${item.id}`} className="contents group">
                        <span className="flex items-center justify-center border-b border-gray-100 px-2 py-4 text-center text-sm text-muted transition-colors group-hover:bg-surface">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                        <span className="flex items-center truncate border-b border-gray-100 px-5 py-4 text-sm text-title transition-colors group-hover:bg-surface">
                            {item.title}
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted transition-colors group-hover:bg-surface">
                            {new Date(item.created_at).toLocaleDateString("ko-KR")}
                        </span>
                    </Link>
                ))}
            </div>
            <Pagination
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={onPageChange}
            />
        </>
    );
}
