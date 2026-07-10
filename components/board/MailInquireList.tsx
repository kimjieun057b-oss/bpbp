"use client";
import { Fragment, useEffect, useState } from "react";
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
const GRID_COLS = "grid-cols-[60px_minmax(90px,0.5fr)_minmax(180px,1fr)_minmax(90px,0.5fr)_minmax(100px,0.5fr)_minmax(100px,0.5fr)]";

export default function MailInquireList() {
    const [inquire, setInquire] = useState<MailInquireItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { currentItems, currentPage, totalCount, onPageChange } = usePagination(inquire, ITEMS_PER_PAGE);

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
            <div className={`card grid ${GRID_COLS} min-h-40`}>
                <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">구분</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">제목</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">문의자</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">답변상태</span>
                <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">접수일</span>

                {currentItems.map((item, index) => (
                    <Fragment key={item.id}>
                        <span className="flex items-center justify-center border-b border-gray-100 px-2 py-4 text-center text-sm text-muted">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center">
                            <span className="badge badge-info">메일문의</span>
                        </span>
                        <span className="flex items-center truncate border-b border-gray-100 px-5 py-4 text-sm text-title">
                            {item.name} 메일 문의입니다.
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted">
                            {maskName(item.name)}
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center">
                            <button
                                type="button"
                                onClick={() => handleToggleAnswered(item.id, item.is_answered)}
                                className={`badge cursor-pointer ${item.is_answered ? 'badge-success' : 'badge-warning'}`}
                            >
                                {item.is_answered ? '답변완료' : '답변대기'}
                            </button>
                        </span>
                        <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted">
                            {new Date(item.created_at).toLocaleDateString("ko-KR")}
                        </span>
                    </Fragment>
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
