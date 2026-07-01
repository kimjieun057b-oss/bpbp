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

interface NoticeListProps {
    basePath?: string;
}

export default function NoticeList({ basePath = '/notice' }: NoticeListProps) {
    const [notice, setnotice] = useState<NoticeBoardItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { currentItems, totalCount, onPageChange } = usePagination(notice, ITEMS_PER_PAGE);

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
            <ul className="card divide-y divide-gray-100 min-h-106">
                {currentItems.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={`${basePath}/${item.id}`}
                            className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
                        >
                            <span className="text-sm text-title truncate flex-1">{item.title}</span>
                            <span className="text-xs text-muted ml-4 shrink-0">
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
