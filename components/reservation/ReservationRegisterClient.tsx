"use client";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReservationCalendar from "./ReservationCalendar";
import ReservationSummary, { Room } from "./ReservationSummary";
import Toast from "../common/Toast";
import { supabase } from "@/lib/supabase";
import { formatDateISO, isDateRangeOverlapping } from "@/lib/reservationDate";
import { AddonOption } from "@/lib/reservationOptions";
import { UNIT_LABEL, josa } from "@/config/terms";

interface Booking {
    room_id: string;
    check_in: string;
    check_out: string;
}

// 예약 등록 고객용 캘린더
export default function ReservationRegisterClient() {
    const router = useRouter();
    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const [checkIn, setCheckIn] = useState<string | null>(null);
    const [checkOut, setCheckOut] = useState<string | null>(null);
    const [hoverDate, setHoverDate] = useState<string | null>(null);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [options, setOptions] = useState<AddonOption[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [extraPeople, setExtraPeople] = useState(0);
    const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [userId, setUserId] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [vaild, setVaild] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // 로그인한 회원이면 저장된 이름/연락처를 예약자 정보에 자동으로 채워준다.
    useEffect(() => {
        const loadUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const metaName = user.user_metadata?.name || user.user_metadata?.full_name || "";
                    const metaPhone = user.user_metadata?.phone || "";
                    setUserId(user.id);
                    setName((prev) => prev || metaName);
                    setPhone((prev) => prev || metaPhone);
                }
            } catch (err) {
                console.error("Fail user load...", err);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                const res = await fetch('/api/reservation/rooms');
                const { data } = await res.json();
                setRooms(data ?? []);
            } catch (err) {
                console.error("Fail rooms load...", err);
            }
        };
        loadRooms();
    }, []);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const res = await fetch('/api/reservation/options');
                const { data } = await res.json();
                setOptions(data ?? []);
            } catch (err) {
                console.error("Fail options load...", err);
            }
        };
        loadOptions();
    }, []);

    const loadAvailability = useCallback(async () => {
        try {
            const res = await fetch(`/api/reservation/availability?year=${year}&month=${month + 1}`);
            const { data } = await res.json();
            setBookings(data ?? []);
        } catch (err) {
            console.error("Fail availability load...", err);
        }
    }, [year, month]);

    useEffect(() => {
        loadAvailability();
    }, [loadAvailability]);

    // 객실은 room.quantity개 만큼 동시 보유하고 있으므로, 겹치는 예약 수가 quantity 이상일 때만 마감으로 취급한다.
    const fullyBookedDates = useMemo(() => {
        const result = new Set<string>();
        if (rooms.length === 0) return result;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const iso = formatDateISO(year, month, day);
            const allRoomsFull = rooms.every((room) => {
                const bookedCount = bookings.filter(
                    (b) => b.room_id === room.id && b.check_in <= iso && iso < b.check_out
                ).length;
                return bookedCount >= room.quantity;
            });
            if (allRoomsFull) result.add(iso);
        }
        return result;
    }, [rooms, bookings, year, month]);

    const unavailableRoomIds = useMemo(() => {
        const result = new Set<string>();
        if (!checkIn || !checkOut) return result;

        for (const room of rooms) {
            const overlapCount = bookings.filter(
                (b) => b.room_id === room.id && isDateRangeOverlapping(checkIn, checkOut, b.check_in, b.check_out)
            ).length;
            if (overlapCount >= room.quantity) result.add(room.id);
        }
        return result;
    }, [checkIn, checkOut, rooms, bookings]);

    const handlePrevMonth = () => {
        setMonth((m) => {
            if (m === 0) {
                setYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const handleNextMonth = () => {
        setMonth((m) => {
            if (m === 11) {
                setYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    };

    const handleSelectDate = (iso: string) => {
        if (!checkIn || checkOut) {
            setCheckIn(iso);
            setCheckOut(null);
            setSelectedRoomId(null);
            setExtraPeople(0);
            return;
        }

        if (iso <= checkIn) {
            setCheckIn(iso);
            return;
        }

        setCheckOut(iso);
    };

    const handleChangeExtraPeople = (delta: number) => {
        const room = rooms.find((r) => r.id === selectedRoomId);
        const max = room ? Math.max(0, room.max_people - room.base_people) : 0;
        setExtraPeople((prev) => Math.min(max, Math.max(0, prev + delta)));
    };

    const handleToggleOption = (id: string) => {
        setSelectedOptionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSubmit = async () => {
        if (submitting) return;

        if (!checkIn || !checkOut || !selectedRoomId) {
            setVaild(`체크인/체크아웃 날짜와 ${josa(UNIT_LABEL, "을", "를")} 선택해 주세요.`);
            return;
        }
        if (!name.trim()) {
            setVaild("이름을 입력해 주세요.");
            return;
        }
        if (!/^[0-9]{10,11}$/.test(phone)) {
            setVaild("연락처를 숫자만 입력해 주세요.");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch('/api/reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: selectedRoomId,
                    check_in: checkIn,
                    check_out: checkOut,
                    extra_people: extraPeople,
                    options: selectedOptionIds,
                    name,
                    phone,
                    user_id: userId,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || '예약에 실패했습니다.');

            setIsSuccess(true);
            setVaild("예약이 완료되었습니다.");
        } catch (err: any) {
            setVaild(err.message || '서버 내부 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseToast: Dispatch<SetStateAction<string | null>> = (value) => {
        if (isSuccess) {
            router.push('/reservation/check');
            return;
        }
        setVaild(value);
    };

    return (
        <>
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
                <div className="flex flex-col gap-6 lg:flex-1">
                    <div className="lg:sticky lg:top-20">
                        <ReservationCalendar
                            year={year}
                            month={month}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            hoverDate={hoverDate}
                            fullyBookedDates={fullyBookedDates}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            onSelectDate={handleSelectDate}
                            onHoverDate={setHoverDate}
                        />
                    </div>
                </div>
                <ReservationSummary
                    checkIn={checkIn}
                    checkOut={checkOut}
                    rooms={rooms}
                    options={options}
                    unavailableRoomIds={unavailableRoomIds}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={setSelectedRoomId}
                    extraPeople={extraPeople}
                    onChangeExtraPeople={handleChangeExtraPeople}
                    selectedOptionIds={selectedOptionIds}
                    onToggleOption={handleToggleOption}
                    name={name}
                    phone={phone}
                    onChangeName={setName}
                    onChangePhone={setPhone}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                />
            </div>
            <Toast vaild={vaild} setVaild={handleCloseToast} />
        </>
    );
}
