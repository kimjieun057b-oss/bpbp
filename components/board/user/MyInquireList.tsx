"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "../../common/Pagination";

interface MyInquireItem {
    id: number;
    category: string;
    title: string;
    privacy: boolean;
    created_at: string;
    comment_count: number;
    is_answered: boolean;
}

const ITEMS_PER_PAGE = 8;

export default function MyInquireList() {
    const [inquire, setInquire] = useState<MyInquireItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const { currentItems, totalCount, onPageChange } = usePagination(inquire, ITEMS_PER_PAGE);

    useEffect(() => {
        const load = async () => {
            try {
                // 로그인한 본인 글만 조회해야 하므로 user_id를 먼저 확인한다.
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsLoggedIn(false);
                    return;
                }

                const res = await fetch(`/api/inquire/board-user?user_id=${user.id}`);
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
    if (!isLoggedIn) return <div className="loading">로그인 후 이용할 수 있습니다.</div>;
    if (inquire.length === 0) return <div className="loading">작성한 문의 내역이 없습니다.</div>;

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
