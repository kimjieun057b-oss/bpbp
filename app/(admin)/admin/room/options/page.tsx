"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface RoomOptionItem {
    id: string;
    label: string;
    price: number;
}

const GRID_COLS = "grid-cols-[60px_1fr_minmax(120px,auto)]";

export default function RoomOptionsPage() {
    const [options, setOptions] = useState<RoomOptionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/admin/room-options');
                const { data } = await res.json();
                setOptions(data ?? []);
            } catch (err: any) {
                console.error("Fail data load...", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-title">부가 서비스 관리</h2>
                <Link href="/admin/room/options/new" className="btn-primary">
                    부가서비스 등록
                </Link>
            </div>

            <div className="card">
                {loading && <p className="px-5 py-8 text-center text-sm text-muted">정보를 불러오는 중입니다.</p>}

                {!loading && options.length === 0 && (
                    <p className="px-5 py-8 text-center text-sm text-muted">등록된 부가서비스가 없습니다.</p>
                )}

                {!loading && options.length > 0 && (
                    <div className={`grid ${GRID_COLS}`}>
                        <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
                        <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">부가서비스명</span>
                        <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">가격</span>

                        {options.map((option, index) => (
                            <Fragment key={option.id}>
                                <Link href={`/admin/room/options/${option.id}/edit`} className="contents">
                                    <span className="flex items-center justify-center border-b border-gray-100 px-2 py-3.5 text-center text-sm text-muted transition-colors hover:bg-surface">
                                        {index + 1}
                                    </span>
                                    <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-title transition-colors hover:bg-surface">
                                        {option.label}
                                    </span>
                                    <span className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 text-center text-sm text-primary transition-colors hover:bg-surface">
                                        {option.price.toLocaleString()}원
                                    </span>
                                </Link>
                            </Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
