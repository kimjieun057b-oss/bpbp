import { getCalendarClient, RESERVATION_CALENDAR_ID } from "./client";

interface CreateReservationEventInput {
    reservationId: string;
    roomName: string;
    guestName: string;
    phone: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD (체크아웃일 당일은 포함하지 않음, Google 종일 일정의 end.date와 동일한 규칙)
    extraPeople: number;
}

// 예약이 확정될 때 관리자용 구글 캘린더에 종일 일정으로 등록한다.
// 예약 id는 별도 DB 컬럼 없이 이벤트의 extendedProperties.private에 저장해두고,
// 취소 승인 시 이 값으로 이벤트를 검색해 삭제한다.
export async function createReservationEvent(input: CreateReservationEventInput) {
    const calendar = getCalendarClient();

    await calendar.events.insert({
        calendarId: RESERVATION_CALENDAR_ID,
        requestBody: {
            summary: `[예약] ${input.roomName} - ${input.guestName}`,
            description: [
                `연락처: ${input.phone}`,
                `추가 인원: ${input.extraPeople}명`,
                `예약 ID: ${input.reservationId}`,
            ].join("\n"),
            start: { date: input.checkIn },
            end: { date: input.checkOut },
            extendedProperties: {
                private: { reservationId: input.reservationId },
            },
        },
    });
}

// 취소가 승인될 때 예약 id로 이벤트를 찾아 삭제한다.
export async function deleteReservationEvent(reservationId: string) {
    const calendar = getCalendarClient();

    const { data } = await calendar.events.list({
        calendarId: RESERVATION_CALENDAR_ID,
        privateExtendedProperty: [`reservationId=${reservationId}`],
    });

    const eventIds = (data.items ?? [])
        .map((event) => event.id)
        .filter((id): id is string => Boolean(id));

    await Promise.all(
        eventIds.map((eventId) =>
            calendar.events.delete({ calendarId: RESERVATION_CALENDAR_ID, eventId })
        )
    );
}
