import { formatDateISO, todayISO } from "@/lib/reservationDate";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthWeeks(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

type DayState = "today" | "past" | "checkin" | "checkout" | "in-range" | "booked" | "default";

const DAY_STATE_CLASS: Record<DayState, string> = {
    today: "border border-primary text-primary font-semibold",
    past: "text-muted",
    checkin: "bg-primary text-white font-semibold",
    checkout: "bg-primary text-white font-semibold",
    "in-range": "bg-primary/10 text-primary",
    booked: "text-muted line-through cursor-not-allowed",
    default: "text-title hover:bg-surface",
};

interface ReservationCalendarProps {
    year: number;
    month: number;
    checkIn: string | null;
    checkOut: string | null;
    hoverDate: string | null;
    fullyBookedDates: Set<string>;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDate: (iso: string) => void;
    onHoverDate: (iso: string | null) => void;
}

// 예약 캘린더 UI : 체크인>체크아웃 클릭 흐름, 마감일 비활성화
export default function ReservationCalendar({
    year,
    month,
    checkIn,
    checkOut,
    hoverDate,
    fullyBookedDates,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
    onHoverDate,
}: ReservationCalendarProps) {
    const today = todayISO();
    const weeks = getMonthWeeks(year, month);

    const previewEnd = checkIn && !checkOut ? hoverDate : null;

    const getDayState = (iso: string): DayState => {
        if (fullyBookedDates.has(iso)) return "booked";
        if (checkIn && iso === checkIn) return "checkin";
        if (checkOut && iso === checkOut) return "checkout";
        if (checkIn && checkOut && iso > checkIn && iso < checkOut) return "in-range";
        if (checkIn && previewEnd && iso > checkIn && iso < previewEnd) return "in-range";
        if (checkIn && previewEnd && iso > previewEnd && iso < checkIn) return "in-range";
        if (iso === today) return "today";
        if (iso < today) return "past";
        return "default";
    };

    return (
        <section className="card flex-1 p-4 sm:p-5 md:p-6" onMouseLeave={() => onHoverDate(null)}>
            <div className="mb-6 flex items-center justify-between">
                <button type="button" onClick={onPrevMonth} className="px-2 py-1 text-body hover:text-primary" aria-label="이전 달">
                    ‹
                </button>
                <h3 className="text-base font-semibold text-title md:text-lg">
                    {year}년 {month + 1}월
                </h3>
                <button type="button" onClick={onNextMonth} className="px-2 py-1 text-body hover:text-primary" aria-label="다음 달">
                    ›
                </button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-xs text-muted md:text-sm">
                {WEEKDAYS.map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
                {weeks.map((week, weekIndex) =>
                    week.map((day, dayIndex) => {
                        const iso = day ? formatDateISO(year, month, day) : null;
                        const state = iso ? getDayState(iso) : "default";
                        const disabled = state === "past" || state === "booked";

                        return (
                            <div key={`${weekIndex}-${dayIndex}`} className="flex items-center justify-center py-1">
                                {day && iso && (
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onSelectDate(iso)}
                                        onMouseEnter={() => onHoverDate(iso)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors md:h-10 md:w-10 md:text-sm ${DAY_STATE_CLASS[state]}`}
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    체크인/체크아웃
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/10" />
                    선택 기간
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                    예약 마감
                </span>
            </div>
        </section>
    );
}
