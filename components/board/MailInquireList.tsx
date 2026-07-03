"use client";
import { useEffect, useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { maskName } from "@/lib/maskName";
import Pagination from "../common/Pagination";

interface MailInquireItem {
    id: number;
    name: string;
    title: string;
    is_answered: boolean;
    created_at: string;
}

const ITEMS_PER_PAGE = 8;

export default function MailInquireList() {
    const [inquire, setInquire] = useState<MailInquireItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { currentItems, totalCount, onPageChange } = usePagination(inquire, ITEMS_PER_PAGE);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/inquire/mail');
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

    const handleToggleAnswered = async (id: number, current: boolean) => {
        setInquire(prev => prev.map(item => item.id === id ? { ...item, is_answered: !current } : item));

        try {
            const res = await fetch(`/api/inquire/mail/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_answered: !current }),
            });

            if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
        } catch (err: any) {
            console.error(err);
            setInquire(prev => prev.map(item => item.id === id ? { ...item, is_answered: current } : item));
        }
    };

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (inquire.length === 0) return <div className="loading">문의 내용이 존재하지 않습니다.</div>;

    return (
        <>
            <ul className="card divide-y divide-gray-100 min-h-106">
                {currentItems.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center gap-4 px-5 py-4"
                    >
                        <span className="badge badge-info">
                            메일문의
                        </span>
                        <span className="text-sm text-title truncate flex-1">
                            {item.name} 메일 문의입니다.
                        </span>
                        <span className="text-xs text-muted shrink-0 hidden sm:block">{maskName(item.name)}</span>
                        <button
                            type="button"
                            onClick={() => handleToggleAnswered(item.id, item.is_answered)}
                            className={`badge cursor-pointer ${item.is_answered ? 'badge-success' : 'badge-warning'}`}
                        >
                            {item.is_answered ? '답변완료' : '답변대기'}
                        </button>
                        <span className="text-xs text-muted shrink-0">
                            {new Date(item.created_at).toLocaleDateString("ko-KR")}
                        </span>
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
