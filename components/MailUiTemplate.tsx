
export default function MailUiTemplate() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-surface px-5 py-10 font-sans">
      <article className="flex w-full max-w-150 flex-col overflow-hidden rounded-lg border-t-4 border-blue-600 bg-white shadow-md">
        <header className="px-9 pb-6 pt-9">
          <span className="mb-4 inline-block rounded bg-blue-50 px-3 py-1 text-[13px] font-bold text-blue-600">
            신규 문의
          </span>
          <h1 className="mb-2.5 text-xl font-bold leading-snug text-gray-900">
            title
          </h1>
          <p className="text-sm text-gray-500">
            접수 일시: {new Date().toLocaleString("ko-KR")}
          </p>
        </header>

        <section className="px-9 py-8">
          <h3 className="mb-3.5 text-[15px] font-semibold text-gray-700">
            문의 내용
          </h3>
          <div className="min-h-30 whitespace-pre-wrap rounded-md border border-gray-100 bg-gray-50 p-5 text-sm leading-loose text-gray-600">
            contents
          </div>
        </section>

        <section className="px-9 pb-9 pt-8">
          <h3 className="mb-4 text-[15px] font-semibold text-gray-700">
            고객 정보
          </h3>

          <div className="flex flex-col">
            <div className="flex border-b border-gray-100 py-3">
              <div className="w-32.5 shrink-0 text-sm font-medium text-gray-500">
                고객명
              </div>
              <div className="text-sm font-semibold text-gray-900">name</div>
            </div>

            <div className="flex border-b border-gray-100 py-3">
              <div className="w-32.5 shrink-0 text-sm font-medium text-gray-500">
                연락처
              </div>
              <div className="text-sm font-semibold text-gray-900">phone</div>
            </div>

            <div className="flex border-b border-gray-100 py-3">
              <div className="w-32.5 shrink-0 text-sm font-medium text-gray-500">
                이메일 주소
              </div>
              <div className="text-sm font-semibold text-gray-900">email</div>
            </div>

            <div className="flex py-3">
              <div className="w-32.5 shrink-0 text-sm font-medium text-gray-500">
                팩스
              </div>
              <div className="text-sm font-semibold text-gray-900">
                fax
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 bg-gray-50 px-9 py-4.5 text-center text-xs text-gray-400">
          본 메일은 시스템에 의해 자동으로 발송된 알림 메일입니다.<br/> 본 수신함은 발송 전용입니다.
        </footer>
      </article>
    </div>
  );
}
