import { calcNights, formatDateISO, isDateRangeOverlapping, todayISO } from "@/lib/reservationDate";
import { AdminReservationItem } from "@/lib/adminReservation";
import { ADMIN_STATUS_BAR_CLASS, getDisplayStatus } from "@/lib/reservationStatus";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_LANES = 2;

interface MonthCell {
    date: Date;
    inMonth: boolean;
}

function getMonthWeeks(year: number, month: number): MonthCell[][] {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const cells: MonthCell[] = [];
    for (let i = 0; i < totalCells; i++) {
        const date = new Date(year, month, i - startWeekday + 1);
        cells.push({ date, inMonth: date.getMonth() === month });
    }

    const weeks: MonthCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

function addDaysISO(iso: string, days: number) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return formatDateISO(d.getFullYear(), d.getMonth(), d.getDate());
}

interface WeekSegment {
    reservation: AdminReservationItem;
    startCol: number;
    span: number;
    isActualStart: boolean;
    isActualEnd: boolean;
}

// 해당 주(week)에 걸쳐있는 예약들을 요일 컬럼(startCol~span)으로 변환
// 체크아웃 당일도 오전까지는 손님이 머무는 날이라 바에서 함께 보여준다 (숙박일수만 표시하면
// 체크인~체크아웃 하루 전날까지만 그려져서 실제보다 짧은 일정처럼 보이는 문제가 있었음).
function computeWeekSegments(weekDates: string[], reservations: AdminReservationItem[]): WeekSegment[] {
    const weekStart = weekDates[0];
    const weekEndExclusive = addDaysISO(weekDates[6], 1);

    return reservations
        .map((r) => ({ r, visualCheckOutExclusive: addDaysISO(r.checkOut, 1) }))
        .filter(({ r, visualCheckOutExclusive }) => isDateRangeOverlapping(r.checkIn, visualCheckOutExclusive, weekStart, weekEndExclusive))
        .map(({ r, visualCheckOutExclusive }) => {
            const segStart = r.checkIn > weekStart ? r.checkIn : weekStart;
            const segEndExclusive = visualCheckOutExclusive < weekEndExclusive ? visualCheckOutExclusive : weekEndExclusive;
            const startCol = weekDates.indexOf(segStart);
            const endCol = weekDates.indexOf(addDaysISO(segEndExclusive, -1));

            return {
                reservation: r,
                startCol,
                span: endCol - startCol + 1,
                isActualStart: segStart === r.checkIn,
                isActualEnd: segEndExclusive === visualCheckOutExclusive,
            };
        })
        .sort((a, b) => a.startCol - b.startCol || b.span - a.span);
}

// 같은 주 안에서 겹치는 예약은 겹치지 않는 lane(줄)으로 분배 (간트차트 방식)
function assignLanes(segments: WeekSegment[]) {
    const laneLastCol: number[] = [];
    return segments.map((seg) => {
        let lane = laneLastCol.findIndex((lastCol) => lastCol < seg.startCol);
        if (lane === -1) {
            lane = laneLastCol.length;
            laneLastCol.push(seg.startCol + seg.span - 1);
        } else {
            laneLastCol[lane] = seg.startCol + seg.span - 1;
        }
        return { ...seg, lane };
    });
}

interface AdminReservationCalendarProps {
    year: number;
    month: number;
    reservations: AdminReservationItem[];
    selectedId: string | null;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectReservation: (id: string) => void;
}

export default function AdminReservationCalendar({
    year,
    month,
    reservations,
    selectedId,
    onPrevMonth,
    onNextMonth,
    onSelectReservation,
}: AdminReservationCalendarProps) {
    const today = todayISO();
    const weeks = getMonthWeeks(year, month);

    return (
        <section className="card flex-1 p-4 sm:p-5 md:p-6">
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

            <div className="mb-2 grid grid-cols-7 text-center text-xs text-muted">
                {WEEKDAYS.map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
                {weeks.map((week, weekIndex) => {
                    const weekDates = week.map((cell) => formatDateISO(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate()));
                    const laned = assignLanes(computeWeekSegments(weekDates, reservations));
                    const visible = laned.filter((s) => s.lane < MAX_LANES);
                    const hiddenCount = laned.length - visible.length;

                    return (
                        <div key={weekIndex} className="py-2">
                            <div className="grid grid-cols-7 gap-2">
                                {week.map((cell, dayIndex) => {
                                    const iso = weekDates[dayIndex];
                                    const isToday = iso === today;
                                    const isPast = iso < today;

                                    return (
                                        <div key={dayIndex} className="flex justify-center">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                                    !cell.inMonth ? "text-muted/50" : isToday ? "border border-primary font-semibold text-primary" : isPast ? "text-muted" : "text-title"
                                                }`}
                                            >
                                                {cell.date.getDate()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {visible.length > 0 && (
                                <div className="mt-1 grid grid-cols-7 gap-x-2 gap-y-1">
                                    {visible.map((seg) => {
                                        const displayStatus = getDisplayStatus(seg.reservation.status, seg.reservation.checkIn);
                                        return (
                                            <button
                                                key={seg.reservation.id}
                                                type="button"
                                                onClick={() => onSelectReservation(seg.reservation.id)}
                                                style={{ gridColumn: `${seg.startCol + 1} / span ${seg.span}`, gridRow: seg.lane + 1 }}
                                                className={`truncate px-2 py-1 text-left text-xs transition-colors ${
                                                    seg.isActualStart ? "rounded-l" : ""
                                                } ${seg.isActualEnd ? "rounded-r" : ""} ${
                                                    selectedId === seg.reservation.id
                                                        ? ADMIN_STATUS_BAR_CLASS[displayStatus].selected
                                                        : ADMIN_STATUS_BAR_CLASS[displayStatus].base
                                                }`}
                                            >
                                                {seg.reservation.roomName} · {calcNights(seg.reservation.checkIn, seg.reservation.checkOut)}박 · {seg.reservation.people}인
                                                
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {hiddenCount > 0 && <div className="mt-1 text-center text-xs text-muted">+{hiddenCount}건 더보기</div>}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
