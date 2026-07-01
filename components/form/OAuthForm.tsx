export default function OAuthForm () {
    return (
        <form>

        </form>
    )
}

// supabase vs nextAuth : 인증 주체(서버)를 어디에 둘 것인가
// 인증 주체 : supabase Auth(자체 기능), nextAuth.js (Auth.js)
// supabse : 유저 세션과 JWT 토큰을 발행하고 관리 / nextAuth: 내 Next 서버가 세션 쿠키를 발행하고 인증 백엔드 역할
// supabase 가 제공하는 SDK 클라우드 메서드 (supabase.auth.sighInWithOAuth) 사용 / nextAuth : Next.js 내부 미들웨어와 API Routes에서 인증처리
// Supabase 생태계 안에 쓸 때 가장 편함 - 오직 DB가 supabase 뿐이고 제공하는 보안기능 (RLS)등을 적극 사용 시에 활용
// nextAuth : supabase 없이 사용할 때 DB 없이도 로그인 시스템 구축 가능, 암호화된 JWT 토큰을 만들어 브라우저 쿠키에 저장, 로그인 여부 확인 시, DB 조회가 필요없어 속도가 빠름, 보안 알아서 처리
//  사용 예시 --> 소셜 로그인을 nextAuth만 사용해서 구현 (소셜 로그인이 주력인 경우)

// NomalLoginForm vs OAuthForm
// Nomal(일반 로그인) : 내가 만든 DB에서 계정정보 저장 및 관리 -> 보안 책임(비밀번호 암호화, 해킹대비, 비번 찾기 등)을 모두 개발자가 구현하고 책임
// OAuth : 비번을 내 사이트에 저장하지 않고 대기업에 인증을 위임하는 프로토콜 -> 구글/카카오 창에 비번을 입력할 뿐, 내 사이트(서버)에 비밀번호를 전달하지 않음 -> 비번 보안, 2단계 인증 등은 구글/카카오가 대신

// - figma wadiz
// - supabase email/social login (google, kakao)
// - map : kakao, naver
// - inquireQuickList (gmail list, db save)
// - git, vercel
// - nextAuth - social login (OAuth)

// Zustand (전역 상태 관리 라이브러리)
// : 불필요한 렌더링 방지
// Context API는 상태가 하나가 바뀌면 그 context를 바라보는 하위 컴포넌트 전체가 리렌더링
// but, Zustand는 해당 상태를 직접 사용하는 컴포넌트만 정확하게 골라서 리렌더링
// 여러 컴포넌트가 동시에 같은 데이터를 공유하고 수정해야할 때 (EX: 장바구니의 상태 : 상품 리스트 페이지, 상단 네비게이션바의 장바구니 개수 아이콘, 결제 페이지 등)
// Prop Drilling 이 심해질 때, 로그인한 유저의 세션 정보나 전역 테마 관리할 때 (EX: 다크/라이트 모드, 현 로그인한 유저의 프로필 정보 처럼 앱 전체 서비스에서 광범위하게 참조되는 데이터 관리)
// 클라이언트 상태에 최적화 ---> UI 테마, 장바구니, 모달 열림 여부 등, 순수 프론트엔드 데이터 (X: DB에서 불러오는 유저 목록, 게시글 데이터, 상품 상세 정보 등 API 호출 데이터)

// npm (node package manager) : 외부 라이브러리 (Zustand, Tailwind, Lucide)를 다운로드하고 업데이트, 관리
//  - 프로젝트 루트의 node_modules, package.json 제어
// vite (빌드 도구, 개발 서버) : 소스코드 (ts, jsx, css)를 브라우저가 읽을 수 있는 js/css 파일로 변환하여 묶어줌 (빌드)
//  - 개발모드 (vite dev)에서 서버를 띄우고 배포용 파일(vite build) 생성
// ---> npm을 사용해서 Vite 설치 (npm install -D vite)
// vite : 순수 클라이언트 사이드 렌더링 (CSR)기반 프로젝트 진행 시 (가벼운 프로젝트)
// ! : next 내부에서는 vite를 빌드 도구로 사용X --> 이미 자체적으로 더 강력하고 최적화된 내부 컴파일러, 빌드 시스템이 있기 때문
// 로그인한 관리자만 쓰는 복잡한 기능 중심의 화면 : React+Vite 사용