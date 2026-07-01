export default function MailUiTemplate() {
  return (
    <div
      style={{
        backgroundColor: "#f4f6f8",
        padding: "40px 20px",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <article
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          borderTop: "5px solid #2563eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 1. 상단 헤더 구역 */}
        <header style={{ padding: "35px 35px 25px 35px" }}>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "13px",
              color: "#2563eb",
              backgroundColor: "#eff6ff",
              padding: "5px 12px",
              borderRadius: "4px",
              display: "inline-block",
              marginBottom: "16px",
            }}
          >
            분류
          </span>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 10px 0",
              lineHeight: "1.4",
            }}
          >
            제목
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            접수 일시: 2026.00.00
          </p>
        </header>

        {/* 구분선 */}
        <div style={{ padding: "0 35px" }}>
          <div style={{ borderBottom: "1px solid #e5e7eb" }} />
        </div>

        {/* 2. 문의 내용 구역 */}
        <section style={{ padding: "30px 35px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 14px 0",
            }}
          >
            문의 내용
          </h3>
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#4b5563",
              backgroundColor: "#f9fafb",
              padding: "22px",
              borderRadius: "6px",
              border: "1px solid #f3f4f6",
              whiteSpace: "pre-wrap",
              minHeight: "120px",
            }}
          >
            문의 내용
          </div>
        </section>

        {/* 구분선 */}
        <div style={{ padding: "0 35px" }}>
          <div style={{ borderBottom: "1px solid #e5e7eb" }} />
        </div>

        {/* 3. 고객 정보 구역 */}
        <section style={{ padding: "30px 35px 35px 35px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 16px 0",
            }}
          >
            고객 정보
          </h3>
          
          {/* 표 형태의 레이아웃을 무너뜨리지 않는 Flex 구조 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {/* 이름 행 */}
            <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6", padding: "13px 0" }}>
              <div
                style={{
                  width: "130px",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                고객명
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                문의자 이름
              </div>
            </div>

            {/* 이메일 행 */}
            <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6", padding: "13px 0" }}>
              <div
                style={{
                  width: "130px",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                이메일 주소
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                이메일
              </div>
            </div>
          </div>
        </section>

        {/* 4. 푸터 구역 */}
        <footer
          style={{
            backgroundColor: "#f9fafb",
            padding: "18px 35px",
            textAlign: "center",
            fontSize: "12px",
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          본 메일은 시스템에 의해 자동으로 발송된 알림 메일입니다. 본 수신함은 발송 전용입니다.
        </footer>
      </article>
    </div>
  );
}