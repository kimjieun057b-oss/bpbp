import { AddonOption, calcOptionsPrice } from "@/lib/reservationOptions";
import { calcNights } from "@/lib/reservationDate";
import { UNIT_LABEL, josa } from "@/config/terms";

export interface Room {
    id: string;
    name: string;
    base_price: number;
    base_people: number;
    max_people: number;
    extra_person_price: number;
    quantity: number;
}

interface ReservationSummaryProps {
    checkIn: string | null;
    checkOut: string | null;
    rooms: Room[];
    options: AddonOption[];
    unavailableRoomIds: Set<string>;
    selectedRoomId: string | null;
    onSelectRoom: (id: string) => void;
    extraPeople: number;
    onChangeExtraPeople: (delta: number) => void;
    selectedOptionIds: string[];
    onToggleOption: (id: string) => void;
    name: string;
    phone: string;
    onChangeName: (value: string) => void;
    onChangePhone: (value: string) => void;
    onSubmit: () => void;
    submitting: boolean;
}

function formatPeriodLabel(checkIn: string | null, checkOut: string | null, nights: number) {
    if (!checkIn || !checkOut) return "날짜를 선택해 주세요.";

    const format = (iso: string) => {
        const d = new Date(iso);
        return `${d.getMonth() + 1}월 ${d.getDate()}일(${"일월화수목금토"[d.getDay()]})`;
    };

    return `${format(checkIn)} ~ ${format(checkOut)} / ${nights}박`;
}

/*
진행중
1. 예약 리스트 관리 : 숫자 배지 / 실시간 예약 달력 (이번달 예약 : 최신순으로 배치, 페이지네이션)
2. 관리자도 고객의 예약을 취소할 수 있도록 기능 개선 / google clander 기능 사용 흐름 확인, 예약된 것만 실시간 반영됨 (취소, 체크인 체크아웃은 안됨)

3. 환불 대기중 -> 예약 취소 확정, 환불 완료 추가
ㄴ 예약 상태 뱃지 : 예약 칸이 살아있는가 (취소 신청중, 취소 확정, 정상예약)
ㄴ 환불 상태 뱃지 : 돈을 환불해주었는가 (대기중, 완료, 실패)
--> 고객이 취소 신청 > 관리자 취소 승인 시 '예약 취소 확정', 환불 대기중 뱃지가 둘다 표시됨 --> 환불 완료 시, 취소확정, 환불완료 뱃지 둘다 표시
* PG사 연동 시, 버튼 클릭으로 자동으로 pg api가 환불실행하는지 확인하기

4. 캠핑장 홈페이지 만들기 (prd > 진짜 홈페이지처럼 ui 꾸미기 / 전반적으로 mo&pc 버전 style 검토) -> 관리자 UI 이쁘게
5. 예시로 캠핑장으로 만들긴 했지만 펜션, 풀빌라에도 바로 활용이 가능한지 확인

추후 확장 예정 : PG사 결제 연동(free test용 -> 환불 관리, 환불 정책 추가) / ERP - 매출확인
확장 : sms api (문의 폼, 예약 완료/취소 알림)
*/

export default function ReservationSummary({
    checkIn,
    checkOut,
    rooms,
    options,
    unavailableRoomIds,
    selectedRoomId,
    onSelectRoom,
    extraPeople,
    onChangeExtraPeople,
    selectedOptionIds,
    onToggleOption,
    name,
    phone,
    onChangeName,
    onChangePhone,
    onSubmit,
    submitting,
}: ReservationSummaryProps) {
    const nights = calcNights(checkIn, checkOut);
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;

    const roomPrice = selectedRoom ? selectedRoom.base_price * nights : 0;
    const extraPeopleFee = selectedRoom ? extraPeople * selectedRoom.extra_person_price * nights : 0;
    const optionsPrice = calcOptionsPrice(selectedOptionIds, options);
    const totalPrice = roomPrice + extraPeopleFee + optionsPrice;

    const maxExtraPeople = selectedRoom ? Math.max(0, selectedRoom.max_people - selectedRoom.base_people) : 0;

    const canSubmit =
        !submitting &&
        Boolean(checkIn && checkOut && selectedRoomId && name.trim() && phone.trim() && nights > 0);

    return (
        <aside className="card space-y-6 p-6 sm:p-6 lg:w-90 lg:shrink-0">
            <div>
                <h4 className="mb-1 text-sm font-semibold text-title">선택한 기간</h4>
                <p className="text-sm text-body">{formatPeriodLabel(checkIn, checkOut, nights)}</p>
            </div>

            <div className="border-t border-gray-100 pt-5">
                <h4 className="mb-3 text-sm font-semibold text-title">{UNIT_LABEL} 선택</h4>
                <div className="space-y-2">
                    {rooms.map((room) => {
                        const isUnavailable = unavailableRoomIds.has(room.id);
                        return (
                            <label
                                key={room.id}
                                className={`flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 has-checked:border-primary has-checked:bg-primary/5 ${
                                    isUnavailable ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="room"
                                        checked={selectedRoomId === room.id}
                                        disabled={isUnavailable}
                                        onChange={() => onSelectRoom(room.id)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm text-title">{room.name}</span>
                                </span>
                                <span className="text-xs text-muted">
                                    {isUnavailable
                                        ? "예약 마감"
                                        : `${room.base_price.toLocaleString()}원 · 기준 ${room.base_people}인`}
                                </span>
                            </label>
                        );
                    })}
                    {rooms.length === 0 && (
                        <p className="text-xs text-muted">등록된 {josa(UNIT_LABEL, "이", "가")} 없습니다.</p>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
                <h4 className="mb-3 text-sm font-semibold text-title">인원</h4>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-body">추가 인원</span>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onChangeExtraPeople(-1)}
                            disabled={extraPeople <= 0}
                            className="h-7 w-7 rounded-full border border-gray-200 text-body hover:border-primary hover:text-primary disabled:opacity-40"
                        >
                            -
                        </button>
                        <span className="w-4 text-center text-sm text-title">{extraPeople}</span>
                        <button
                            type="button"
                            onClick={() => onChangeExtraPeople(1)}
                            disabled={extraPeople >= maxExtraPeople}
                            className="h-7 w-7 rounded-full border border-gray-200 text-body hover:border-primary hover:text-primary disabled:opacity-40"
                        >
                            +
                        </button>
                    </div>
                </div>
                {/* 부가 옵션  */}
                {selectedRoom && (
                    <p className="mt-1 text-xs text-muted">
                        기준 {selectedRoom.base_people}인 · 최대 {selectedRoom.max_people}인 (1인당 +
                        {selectedRoom.extra_person_price.toLocaleString()}원/박)
                    </p>
                )}
            </div>

            <div className="border-t border-gray-100 pt-5">
                <h4 className="mb-3 text-sm font-semibold text-title">부가 서비스</h4>
                <div className="space-y-2">
                    {options.map((option) => (
                        <label key={option.id} className="flex cursor-pointer items-center justify-between text-sm text-body">
                            <span className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedOptionIds.includes(option.id)}
                                    onChange={() => onToggleOption(option.id)}
                                    className="h-4 w-4 accent-primary"
                                />
                                {option.label}
                            </span>
                            <span className="text-xs text-muted">+{option.price.toLocaleString()}원</span>
                        </label>
                    ))}
                    {options.length === 0 && <p className="text-xs text-muted">등록된 부가서비스가 없습니다.</p>}
                </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-5">
                <h4 className="text-sm font-semibold text-title">예약자 정보</h4>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="reservation-name" className="form-label">
                        이름 <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="reservation-name"
                        value={name}
                        onChange={(e) => onChangeName(e.target.value)}
                        placeholder="예약자 이름을 입력해주세요."
                        className="form-input"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="reservation-phone" className="form-label">
                        연락처 <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        id="reservation-phone"
                        value={phone}
                        onChange={(e) => onChangePhone(e.target.value)}
                        placeholder="연락처를 입력해주세요. (숫자만)"
                        className="form-input"
                    />
                </div>
            </div>

            <div className="space-y-1.5 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between text-sm text-body">
                    <span>{UNIT_LABEL} 요금</span>
                    <span>{roomPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-sm text-body">
                    <span>인원 추가 요금</span>
                    <span>{extraPeopleFee.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-sm text-body">
                    <span>부가 서비스</span>
                    <span>{optionsPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-base font-semibold text-title">
                    <span>합계</span>
                    <span className="text-primary">{totalPrice.toLocaleString()}원</span>
                </div>
            </div>

            <button type="button" onClick={onSubmit} disabled={!canSubmit} className="btn-primary w-full">
                {submitting ? "예약 처리 중..." : "예약하기"}
            </button>
        </aside>
    );
}
