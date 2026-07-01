"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePagination } from "@/hooks/usePagination";
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

export default function InquireBoardList() {
    const [inquire, setInquire] = useState<InquireBoardItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { currentItems, totalCount, onPageChange } = usePagination(inquire, ITEMS_PER_PAGE);

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
            <ul className="card divide-y divide-gray-100 min-h-106">
                {currentItems.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={`/inquire/${item.id}`}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-surface transition-colors"
                        >
                            {item.privacy && (
                                <span className="shrink-0 text-xs font-medium text-primary bg-blue-50 px-2 py-0.5 rounded">
                                    비밀글
                                </span>
                            )}
                            <span className="text-sm text-title truncate flex-1">
                                {item.title}
                                {item.comment_count > 0 && (
                                    <span className="ml-1.5 text-primary font-medium">
                                        ({item.comment_count})
                                    </span>
                                )}
                            </span>
                            <span className="text-xs text-muted shrink-0 hidden sm:block">{item.name}</span>
                            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${item.is_answered ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                {item.is_answered ? '답변완료' : '답변대기'}
                            </span>
                            <span className="text-xs text-muted shrink-0">
                                {new Date(item.created_at).toLocaleDateString("ko-KR")}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Pagination
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={onPageChange}
            />
        </>
    );
}
