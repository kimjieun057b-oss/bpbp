"use client";
export default function JoinForm () {
    // 이메일로 회원가입 (+ MailLoginForm)
    return (
        <form className="space-y-4">
            <div>
                <label htmlFor="email" className="form-label">이메일</label>
                <input type="text" id="email" name="email" placeholder="이메일을 입력해주세요" className="form-input"/>
            </div>
            <div>
                <label htmlFor="password" className="form-label">비밀번호</label>
                <input type="password" id="password" name="password" placeholder="비밀번호를 입력해주세요" className="form-input"/>
            </div>
            <button type="submit" className="btn-primary w-full">회원가입</button>
        </form>
    )
}