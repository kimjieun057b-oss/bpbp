"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminReservationItem } from "@/lib/adminReservation";
import { formatDateISO, isDateRangeOverlapping } from "@/lib/reservationDate";
import { ReservationStatus } from "@/lib/reservationStatus";

// 관리자 예약 달력/리스트가 공유하는 데이터 fetch + 상태 변경(낙관적 업데이트) 로직
export function useAdminReservations(year: number, month: number) {
    // API는 주 경계를 넘는 예약까지 캘린더에 정확히 표시하기 위해 전후 1개월씩 버퍼를 두고 조회한다.
    // 그래서 이 원본 배열(reservations)에는 인접 달의 예약도 섞여 있으니, 캘린더의 바 렌더링처럼
    // "주 단위로 겹치는지"를 직접 계산하는 곳이 아니면 반드시 monthReservations를 사용해야 한다.
    const [reservations, setReservations] = useState<AdminReservationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/reservation?year=${year}&month=${month + 1}`);
            const { data } = await res.json();
            setReservations(data ?? []);
        } catch (err) {
            console.error("Fail reservation load...", err);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        load();
    }, [load]);

    // 리스트/패널 등 "이번 달 예약"을 있는 그대로 보여줘야 하는 화면용 - 딱 이번 달에 걸치는 것만
    const monthReservations = useMemo(() => {
        // month + 1이 12를 넘어갈 수 있으므로(12월 -> 다음해 1월) Date 생성자의 자연스러운 롤오버에 맡긴다.
        const nextMonthDate = new Date(year, month + 1, 1);
        const monthStart = formatDateISO(year, month, 1);
        const monthEndExclusive = formatDateISO(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), nextMonthDate.getDate());
        return reservations.filter((r) => isDateRangeOverlapping(r.checkIn, r.checkOut, monthStart, monthEndExclusive));
    }, [reservations, year, month]);

    const changeStatus = useCallback(async (id: string, status: ReservationStatus) => {
        let prevStatus: ReservationStatus | undefined;
        setReservations((prev) =>
            prev.map((r) => {
                if (r.id === id) prevStatus = r.status;
                return r.id === id ? { ...r, status } : r;
            })
        );

        try {
            const res = await fetch(`/api/admin/reservation/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ check_status: status }),
            });
            if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
        } catch (err) {
            console.error(err);
            setReservations((prev) =>
                prev.map((r) => (r.id === id && prevStatus ? { ...r, status: prevStatus as ReservationStatus } : r))
            );
        }
    }, []);

    return { reservations, monthReservations, loading, changeStatus, reload: load };
}
