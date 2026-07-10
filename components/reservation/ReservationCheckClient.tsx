"use client";
import { FormEvent, useState } from "react";
import ReservationResultCard from "./ReservationResultCard";
import ReservationStatusFilter from "./ReservationStatusFilter";
import { ReservationDetail } from "@/lib/reservationDetail";
import {
    ALL_DISPLAY_STATUSES,
    CUSTOMER_STATUS_BADGE_CLASS,
    getDisplayStatus,
    ReservationStatus,
    STATUS_LABEL,
} from "@/lib/reservationStatus";

// 비회원 예약 조회 - 연락처 입력 후 목록에서 선택하면 상세 UI(ReservationResultCard) 표시
export default function ReservationCheckClient() {
    const [phone, setPhone] = useState("");
    const [results, setResults] = useState<ReservationDetail[] | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<ReservationStatus | "all">("all");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!/^[0-9]{10,11}$/.test(phone)) {
            setError("연락처를 숫자만 10~11자리로 입력해 주세요.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSelectedId(null);
            setFilter("all");

            const res = await fetch(`/api/reservation/lookup?phone=${phone}`);
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "조회에 실패했습니다.");

            setResults(result.data ?? []);
        } catch (err: any) {
            setError(err.message || "서버 내부 오류가 발생했습니다.");
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const selected = results?.find((r) => r.id === selectedId) ?? null;
    const filtered = (results ?? []).filter(
        (r) => filter === "all" || getDisplayStatus(r.status, r.check_in) === filter
    );

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="card flex flex-col gap-3 p-6 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1.5">
                    <label htmlFor="check-phone" className="form-label">
                        연락처
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        id="check-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="예약 시 입력한 연락처를 입력해주세요. (숫자만)"
                        className="form-input"
                    />
                </div>
                <button type="submit" disabled={loading} className="btn-primary sm:w-32">
                    {loading ? "조회 중..." : "조회하기"}
                </button>
            </form>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {results && results.length === 0 && <div className="loading">조회된 예약이 없습니다.</div>}

            {results && results.length > 0 && !selected && (
                <div className="space-y-3">
                    <ReservationStatusFilter
                        statuses={ALL_DISPLAY_STATUSES}
                        badgeClassMap={CUSTOMER_STATUS_BADGE_CLASS}
                        active={filter}
                        onChange={setFilter}
                    />

                    {filtered.length === 0 ? (
                        <div className="loading">조건에 맞는 예약이 없습니다.</div>
                    ) : (
                        <ul className="card divide-y divide-gray-100">
                            {filtered.map((r) => {
                                const displayStatus = getDisplayStatus(r.status, r.check_in);
                                return (
                                    <li key={r.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(r.id)}
                                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
                                        >
                                            <span className="flex-1 truncate text-sm text-title">{r.room_name}</span>
                                            <span className="hidden text-xs text-muted sm:block">
                                                {r.check_in} ~ {r.check_out}
                                            </span>
                                            <span className={`badge ${CUSTOMER_STATUS_BADGE_CLASS[displayStatus]}`}>
                                                {STATUS_LABEL[displayStatus]}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {selected && (
                <div className="space-y-3">
                    <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-body hover:text-primary">
                        ‹ 목록으로
                    </button>
                    <ReservationResultCard booking={selected} />
                </div>
            )}
        </div>
    );
}
