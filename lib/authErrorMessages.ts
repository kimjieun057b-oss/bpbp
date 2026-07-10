// Supabase Auth(GoTrue)가 반환하는 영어 에러 메시지를 사용자에게 보여줄 한글 메시지로 변환한다.
// 매칭되는 항목이 없으면 원본 메시지를 그대로 반환한다.
const AUTH_ERROR_MESSAGES: { match: string; message: string }[] = [
    { match: "email rate limit exceeded", message: "이메일 인증 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
    { match: "For security purposes", message: "너무 짧은 간격으로 요청했습니다. 잠시 후 다시 시도해주세요." },
    { match: "Invalid login credentials", message: "가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다." },
    { match: "User already registered", message: "이미 가입된 이메일입니다." },
    { match: "Password should be at least", message: "비밀번호가 너무 짧습니다. 8자 이상 입력해주세요." },
];

export function translateAuthError(message: string | null | undefined) {
    if (!message) return message;
    const found = AUTH_ERROR_MESSAGES.find((item) => message.includes(item.match));
    return found ? found.message : message;
}
