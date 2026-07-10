/*
실시간 예약 달력
- 캘린더 ui 활용해서 예약 날짜,객실,인원등을 한눈에 볼수있는 스케줄표.
- 캘린더 좌측 카드형태로 일정(예약)을 선택하면 상세 내용 확인 가능하며, 체크인/체크아웃 상태를 변경 가능.
*/
import AdminReservationCalendarView from "@/components/admin/AdminReservationCalendarView";

export default function AdminCalendarPage () {
    return (
        <AdminReservationCalendarView />
    )
}