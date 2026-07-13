/*
예약 취소 관리
- 고객이 신청한 예약 취소 요청을 확인하고 승인 처리 (승인 시 환불 진행중으로 전환, 예약 자리 확보)
*/
import AdminCancellationListView from "@/components/admin/AdminCancellationListView";

export default function AdminReservationCancelPage() {
    return (
        <AdminCancellationListView />
    )
}
