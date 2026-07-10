"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePagination } from "@/hooks/usePagination";
import { maskName } from "@/lib/maskName";
import Pagination from "../common/Pagination";

interface InquireBoardItem {
    id: number;
    category: string;
    name: string;
    title: string;
    privacy: boolean;
    created_at: string;
    comment_count: number;
    is_answered: boolean;
}

const ITEMS_PER_PAGE = 8;
const GRID_COLS = "grid-cols-[60px_minmax(200px,1fr)_minmax(90px,0.5fr)_minmax(100px,0.5fr)_minmax(100px,0.5fr)]";

export default function InquireBoardList() {
    const [inquire, setInquire] = useState<InquireBoardItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { currentItems, currentPage, totalCount, onPageChange } = usePagination(inquire, ITEMS_PER_PAGE);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/inquire/board');
                const { data } = await res.json();
                setInquire(data ?? []);
            } catch (err: any) {
                console.error("Fail data load...", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (inquire.length === 0) return <div className="loading">문의 내용이 존재하지 않습니다.</div>;

    return (
        <>
            <div className={`card grid ${GRID_COLS} min-h-40`}>
                <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">제목</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">작성자</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">답변상태</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">작성일</span>

                {currentItems.map((item, index) => (
                    <Link key={item.id} href={`/inquire/${item.id}`} className="contents group">
                        <span className="flex items-center justify-center border-b border-gray-100 px-2 py-4 text-center text-sm text-muted transition-colors group-hover:bg-surface">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                        <span className="flex items-center gap-1.5 truncate border-b border-gray-100 px-5 py-4 text-sm text-title transition-colors group-hover:bg-surface">
                            {item.privacy && <span className="badge badge-info shrink-0">비밀글</span>}
                            <span className="truncate">
                                {item.title}
                                {item.comment_count > 0 && (
                                    <span className="ml-1.5 text-primary font-medium">({item.comment_count})</span>
                                )}
                            </span>
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted transition-colors group-hover:bg-surface">
                            {maskName(item.name)}
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center transition-colors group-hover:bg-surface">
                            <span className={`badge ${item.is_answered ? 'badge-success' : 'badge-warning'}`}>
                                {item.is_answered ? '답변완료' : '답변대기'}
                            </span>
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
