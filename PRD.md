# [PRD] 

## 1. 개요 및 목표 (Overview & Goals)
* **개요**: 홈페이지 제작 시, 자주 사용되는 기능과 UI를 최대한 복사&붙여넣기 만으로 적용할 수 있는 보일러플레이트 제작
* **목표**:
 * 마크업과 핵심 기능을 우선적으로 제작하여 보일러플레이트로 활용할 수 있도록 합니다.
 * style은 프로젝트마다 커스텀이 달라지기 때문에 design의 비중을 두지 않습니다.
 * 단, 개발 및 테스트 시 시각적 불편함이 없도록 단 하나의 포인트 컬러만 사용하는 미니멀하고 깔끔한 레이아웃을 제공합니다.

## 2. 핵심 기능 (Core Features)
복사 후 즉시 비즈니스 로직에 결합하여 테스트할 수 있도록 레이아웃별 필수 인터랙션 코드를 내장합니다.

* **네비게이션 및 GNB (GNB & Navigation)**
  * 모바일 환경 대응을 위한 토글(Open/Close) 상태 관리 로직 (`useState`) 포함.
* **폼 핸들링 및 유효성 검사 (Form Handling)**
  * 인풋 입력값 검증(Validation) 및 실시간 에러 메시지 노출 처리.
  * 브라우저 양식 최적화를 위한 보안 및 유저 편의성 속성(`autocomplete`) 준수.
  * 비밀번호 단독 인증 폼의 경우, 웹 접근성 경고 방지를 위한 시각적 비노출(`hidden`) 처리된 `username` 필드 구조 내장.
* **데이터 페칭 및 상태 관리 (Data Fetching & State)**
  * 비동기 데이터 로딩 상태(`loading`), 성공(`data`), 실패(`error`) 처리를 구조화.
  * API 상태 코드 및 바디 메시지에 따른 프론트엔드 조건부 분기 처리 (예: 비밀글인 경우 자동으로 비밀번호 입력 폼으로 전환).
* **라우터 인터랙션 (Router Interaction)**
  * Next.js App Router 아키텍처 환경에 맞춘 페이지 이동 및 브라우저 원시 이벤트를 이용한 뒤로가기(`router.back()`) 기능 매핑.
* **조건부 렌더링 (Conditional Rendering)**
  * 첨부파일 유무에 따른 다운로드 링크 활성화 및 복잡한 파일명(Storage 경로 접두사 등) 유저용 디코딩 기능 포함.


## 3. 화면 구성 (Layout)
이메일 템플릿과 같이 메일 클라이언트 스펙을 맞춰야 하는 특수 컴포넌트를 제외하고, 모든 웹용 컴포넌트는 유지보수와 스타일 제거/치환이 쉽도록 **Flex 기반의 시맨틱 태그(`header`, `section`, `footer`, `article`) 구조**로 마크업합니다. 가장 기본적인 스타일을 제공하는 'globals.css'를 기본 베이스로 유지합니다.


## 4. 디자인시스템 (Design System)
프로젝트 투입 시 인라인 CSS 스타일을 일괄 제거하거나 Tailwind CSS 클래스로 쉽게 치환할 수 있도록 스타일 테마를 극도로 단순화합니다.

1. 디자인 스타일 변경: 
   - 'AI 생성물'처럼 보이는 과도한 그라데이션과 그림자(Shadow) 효과는 제거해줘.
   - 그림자 대신 `border`와 `border-color`를 사용하여 구조를 명확히 정의하는 'Flat & Clean' 스타일로 변경해줘.
   - 배경색은 제거하고 전체적인 여백(Spacing)과 타이포그래피에 집중하여 깔끔한 기업형 레이아웃을 유지해줘.
   - 테두리 곡률(border-radius)은 일관되게 `8px`(`rounded-lg`)를 사용해줘.

2. 디자인 시스템 및 테마 관리 (유지보수 중심):
   - 색상 관리는 하드코딩하지 말고 `tailwind.config.js`의 `theme.extend.colors`를 사용해줘.
   - 아래의 컬러 팔레트를 `tailwind.config.js`에 설정하고, 컴포넌트에서는 `text-primary`, `bg-primary`, `border-primary` 등의 유틸리티 클래스만 사용해줘.
   
   [컬러 팔레트]
   - primary: #2563eb
   - bg-base: transparent
   - content-box: #ffffff
   - text-main: #111827
   - text-sub: #4b5563
   - text-muted: #9ca3af

3. 출력 형식:
   - 변경된 `tailwind.config.js` 설정 파일 코드.
   - 이 시스템을 적용한 대표적인 UI 컴포넌트(버튼, 카드) 예시.
   - 앞으로 포인트 컬러를 수정할 때 `tailwind.config.js`의 어떤 부분을 수정하면 전체에 일괄 반영되는지 설명해줘.


### Tailwind 토큰 (globals.css `@theme` / tailwind.config.js)

| 토큰 | Tailwind 클래스 | Hex | 용도 |
|---|---|---|---|
| `--color-primary` | `text-primary` / `bg-primary` / `border-primary` | `#2563eb` | 포인트 컬러 |
| `--color-surface` | `bg-surface` | `#f4f6f8` | 전체 페이지 배경 |
| `--color-title` | `text-title` | `#111827` | 제목·강조 텍스트 |
| `--color-body` | `text-body` | `#4b5563` | 본문 텍스트 |
| `--color-muted` | `text-muted` | `#9ca3af` | 날짜·힌트·비활성 텍스트 |
| `--shadow-card` | `shadow-card` | `0 4px 12px rgba(0,0,0,0.08)` | 카드 그림자 |

### 재사용 컴포넌트 클래스 (globals.css `@layer components`)

| 클래스 | 용도 |
|---|---|
| `.card` | 흰색 컨텐츠 카드 (bg-white + rounded-lg + border + shadow-card + overflow-hidden) |
| `.form-input` | 폼 인풋 공통 스타일 (border + rounded-lg + focus ring) |
| `.form-label` | 폼 라벨 공통 스타일 |
| `.btn-primary` | 주요 제출 버튼 (bg-primary + white text) |
| `.btn-ghost` | 보조 취소 버튼 (border + bg-white) |
| `.btn-danger` | 삭제 등 위험 액션 버튼 (bg-red-50 + text-red-600) |
| `.badge` | 뱃지 공통 베이스 (text-xs + rounded) |
| `.badge-info` | 분류/비밀글 등 포인트 컬러 뱃지 (text-primary + bg-primary/10) |
| `.badge-success` | 답변완료 등 긍정 상태 뱃지 (text-green-600 + bg-green-50) |
| `.badge-warning` | 답변대기 등 대기 상태 뱃지 (text-amber-600 + bg-amber-50) |
| `.badge-muted` | 비활성 정보 뱃지 (text-muted + bg-gray-100) |

### 카드 상단 포인트 패턴
```tsx
<div className="card">
  <div className="h-0.5 bg-primary" />  {/* 상단 2px 파란 선 */}
  {/* 콘텐츠 */}
</div>
```