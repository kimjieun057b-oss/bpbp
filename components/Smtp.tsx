export default function Smtp() {
    return (
        <div></div>
    )
}

/*
[SMTP 연동]

suapbase auth - 이메일로 회원가입 등 이메일 인증 시, 메일 커스텀 필요
supabase mail :
 - 개발 환경 테스트용, 시간당 2~30회 발송제한, 트래픽 429 error 발생 문제 주의
 - 개발자 외 일반 외부 사용자에게는 메일 전송이 실패됨
 - 발송자 이름이 supabase로 됨
 --> Resend (하루 100건 무료) SMTP 서비스 연동

1. Resend 가입 -> 도메인 인증 후 SMTP host,port,username,password 발급
2. supabase > Authentication > Provider > Email > SMTP Setting 활성화 > 발급정보 입력

*/