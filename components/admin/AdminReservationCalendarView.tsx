"use client";
import { useMemo, useState } from "react";
import AdminReservationCalendar from "./AdminReservationCalendar";
import AdminReservationPanel from "./AdminReservationPanel";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import Link from "next/link";

export default function AdminReservationCalendarView() {
    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { reservations, monthReservations, loading, changeStatus } = useAdminReservations(year, month);

    const handlePrevMonth = () => {
        setMonth((m) => {
            if (m === 0) {
                setYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
        setSelectedId(null);
    };

    const handleNextMonth = () => {
        setMonth((m) => {
            if (m === 11) {
                setYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
        setSelectedId(null);
    };

    return (
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start">
            <AdminReservationCalendar
                year={year}
                month={month}
                reservations={reservations}
                selectedId={selectedId}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelectReservation={setSelectedId}
            />
            <AdminReservationPanel
                reservations={reservations}
                monthReservations={monthReservations}
                loading={loading}
                selectedId={selectedId}
                onSelectReservation={setSelectedId}
                onBackToList={() => setSelectedId(null)}
                onChangeStatus={changeStatus}
            />
        </div>
    );
}
