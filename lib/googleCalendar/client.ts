import { google } from "googleapis";

// Gmail 연동(lib/gmail.ts)과 동일한 OAuth2 리프레시 토큰 방식을 재사용한다.
// 단, refresh token은 Calendar 스코프(https://www.googleapis.com/auth/calendar)가
// 포함된 것으로 별도 재발급되어 있어야 한다.
/*
GOOGLE_CLIENT_ID /SCRET = supabase 구글 소셜 로그인과 Gmail 발송용으로 재사용중
--> 사용자가 로그인할 때 쓰는 ID, 서버 백에서 gmail/calender api 호출 용도와 성격이 다름
= 같은 클라이언트를 두 용도로 겹쳐 사용하면 리다이렉트URL과 동의화면 설정, 스코프 범위가 꼬이기 쉬워
서버 API 전용으로 별도 OAuth 클라이언트를 생성
*/
export function getCalendarClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    return google.calendar({ version: "v3", auth: oauth2Client });
}

// 지정 안 하면 인증 계정의 기본(primary) 캘린더를 사용한다.
export const RESERVATION_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
