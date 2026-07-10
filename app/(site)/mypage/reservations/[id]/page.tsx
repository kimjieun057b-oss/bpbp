"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ReservationResultCard from "@/components/reservation/ReservationResultCard";
import { ReservationDetail } from "@/lib/reservationDetail";

export default function MyReservationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [booking, setBooking] = useState<ReservationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsLoggedIn(false);
                    return;
                }

                const res = await fetch(`/api/reservation/${id}?user_id=${user.id}`);
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "예약 정보를 불러오지 못했습니다.");

                setBooking(result.data);
            } catch (err: any) {
                setError(err.message || "서버 내부 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
    if (!isLoggedIn) return <div className="loading">로그인 후 이용할 수 있습니다.</div>;
    if (error || !booking) return <div className="loading">{error || "예약 정보를 찾을 수 없습니다."}</div>;

    return (
        <article>
            <div>
                {/* <h2>예약 상세</h2> */}
                <div className="space-y-4">
                    <button type="button" onClick={() => router.push("/mypage")} className="text-sm text-body hover:text-primary">
                        ‹ 목록으로
                    </button>
                    <ReservationResultCard booking={booking} />
                </div>
            </div>
        </article>
    );
}
