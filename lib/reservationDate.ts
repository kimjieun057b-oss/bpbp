// 타임존 이슈를 피하기 위해 Date -> UTC 변환(toISOString) 대신 연/월/일 숫자를 직접 조합
export function formatDateISO(year: number, month: number, day: number) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

export function todayISO() {
    const now = new Date();
    return formatDateISO(now.getFullYear(), now.getMonth(), now.getDate());
}

export function calcNights(checkIn: string | null, checkOut: string | null) {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

// [checkIn, checkOut) 구간이 [rangeStart, rangeEnd) 구간과 겹치는지 (반열림 구간 기준)
export function isDateRangeOverlapping(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
) {
    return aStart < bEnd && bStart < aEnd;
}
