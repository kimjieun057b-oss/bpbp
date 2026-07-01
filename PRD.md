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

* **포인트 컬러 (Point Color)**
  * `#2563eb` (기본 블루 계열 단색 하나만 사용)
  * 텍스트 강조, 주요 버튼 배경색, 컴포넌트 최상단 포인트 보더 선(`borderTop`)에만 제한적으로 적용하여 시인성 확보.
* **무채색 컬러 (Monochrome)**
  * **전체 배경**: `#f4f6f8` (연한 회색으로 화면 구획 및 컴포넌트 경계 분리용)
  * **콘텐츠 박스**: `#ffffff` (기본 흰색 바탕)
  * **주요 타이틀**: `#111827` (가장 짙은 텍스트)
  * **일반 본문**: `#4b5563` (가독성이 확보되는 중간 회색 텍스트)
  * **안내 / 푸터**: `#9ca3af` (비활성 상태 또는 연한 정보용 텍스트)
* **레이아웃 스타일 가이드**
  * 폰트 크기(`fontSize`)는 인라인 스타일로 고정하여 묶어두지 않고, 프로젝트 기본 설정을 자연스럽게 상속받거나 브라우저 기본 크기를 따르도록 최소화하고 단위는 'rem'을 사용.
  * 여백(`padding`, `margin`)과 테두리 곡률(`borderRadius: 8px`)은 레이아웃이 뭉개지지 않을 최소 수치만 부여.
  * 컴포넌트가 공중에 붕 뜨거나 묻히지 않도록 투명도가 들어간 아주 연한 그림자(`boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"`)와 테두리 선(`border: "1px solid #f3f4f6"`)만 활용하여 구조 인지 유도.


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

### 카드 상단 포인트 패턴
```tsx
<div className="card">
  <div className="h-0.5 bg-primary" />  {/* 상단 2px 파란 선 */}
  {/* 콘텐츠 */}
</div>
```