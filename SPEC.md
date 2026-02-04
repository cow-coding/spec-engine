# 📂 Spec-Engine 프로젝트 개발 컨텍스트
**Date:** 2026-02-04
**Project:** VS Code Extension for Automated PRD Generation
**Status:** ✅ Production Ready (배포 준비 완료)

---

## 1. 프로젝트 개요 (Overview)
* **목표:** 개발자가 비즈니스 로직(`.spec`)을 작성하면, AI가 이를 분석하여 기획서(PRD)를 자동으로 생성해주는 VS Code 확장 프로그램 개발.
* **핵심 가치:**
    * **실시간 동기화:** 코드가 바뀌면 로직 계산 결과도 즉시 업데이트.
    * **비용 제로 (Zero Cost):** 클라우드 API 대신 로컬 AI(Ollama)를 사용하여 비용 및 할당량 문제 해결.
    * **보안 (Security):** 코드가 외부 서버로 전송되지 않음.
    * **고품질 PRD:** 프롬프트 최적화로 작은 모델(Gemma 2B)도 상세한 기획서 생성.
* **아이디어의 시작:** https://youtu.be/vENN6-d_3AQ?si=0dUEzJWaSuiwGzad

---

## 2. 핵심 기술 스택 (Tech Stack)

### A. AI 엔진: 로컬 기반 (Local-First)
* **실행 환경:** [Ollama](https://ollama.com/) (사용자 PC에서 구동)
* **기본 모델:** **Gemma 2 (2B)** (Google)
    * 용량: 1.6GB (빠른 다운로드)
    * 속도: 실시간 스트리밍 지원
    * 한국어 처리 능력 우수
* **대안 모델:** Llama 3, Qwen 등 (사용자 설정으로 변경 가능)
* **Stream API:** 실시간 진행률 표시 (텍스트 길이 기반 추정)

### B. VS Code Extension Architecture
* **언어:** TypeScript
* **UI:** Webview API (HTML/CSS/JS)
    * GitHub Markdown 스타일 적용
    * 실시간 로딩 애니메이션 (스피너 + 프로그레스 바)
* **통신:** IPC (Extension Host ↔ Webview 메시지 통신)
* **모듈 구조:** 관심사 분리 (SoC) 적용

---

## 3. 주요 구현 기능 (Key Features)

### 🛠️ 1. 리소스 최적화 (Auto-Sleep System)
* **On-Demand:** 사용자가 '생성' 버튼을 누를 때만 Ollama 서버 실행.
* **Keep-Alive:** 작업 완료 후 **5분간 대기** (연속 작업 지원).
* **Auto-Kill:** 5분간 미사용 시 **서버 프로세스 자동 종료** (메모리 절약).
* **Clean-Exit:** VS Code 종료 시 서버도 즉시 강제 종료.
* **AbortController:** 생성 중 취소 기능 (강제 종료 버튼).

### 🔌 2. 사용자 경험 (UX) & 설치 자동화
* **자동 감지:** Ollama 설치 여부 및 모델 유무 자동 체크.
* **자동 설치:**
    * **Mac:** Homebrew → `brew install ollama`
    * **Windows:** Winget → `winget install Ollama.Ollama`
    * **Linux:** 공식 설치 스크립트 실행
* **모델 다운로드:** 모달 창으로 안내 후 터미널에서 자동 `ollama pull` 실행.
* **로딩 UI:**
    * 회전 스피너 애니메이션
    * 단계별 메시지 (🔍 분석 중 → 🧠 사고 중 → ✍️ 생성 중 → ✨ 마무리 중)
    * 실시간 프로그레스 바 (0% → 95% → 100%)
    * 진행률 표시 (5% 단위)

### 🧠 3. 로직 엔진 (Logic Engine)
* `.spec` 파일 수정 시 **실시간 계산** (AI 미사용, 즉시 반영).
* 지원 함수: `sum`, `avg`, `max`, `min`, `count`, `filter`, `map` (대소문자 무관).
* if-else 조건문 지원.
* Webview 탭이 가려져도 내용 유지 (`retainContextWhenHidden: true`).

### 🎨 4. AI 프롬프트 최적화
* **디테일 강화:** 10년차 시니어 PM 페르소나, 구체적 작성 원칙 명시.
* **Few-Shot Learning:** 실제 예시 포함 (입력 코드 → 출력 PRD).
* **구조화된 출력:**
    * 기능 개요 (2-3문장)
    * 배경 및 목적 (현재 문제 → 해결 방안 → 기대 효과)
    * 핵심 비즈니스 로직 (배경, 조건, 동작 과정, 의미, 예시 시나리오)
    * 계산 결과 해석 (테이블)
    * 예외 처리 및 엣지 케이스
    * 검증 및 테스트 시나리오
* **한국어 최적화:** 프롬프트와 출력 모두 한국어.

### 💾 5. 파일 저장 & 렌더링
* **Markdown 저장:** 원본 `.md` 파일로 저장 (HTML 아님).
* **GitHub 스타일 렌더링:**
    * 헤더 (밑줄, 계층 구조)
    * 테이블 (스트라이프 배경, 테두리)
    * 코드 블록 (배경색, 라운드 모서리)
    * 리스트, 인용문, 링크 등 모든 Markdown 요소 지원
* **VS Code 테마 호환:** 다크/라이트 모드 자동 대응.

### ⚡ 6. Stream 모드 & 진행률 표시
* **백그라운드 스트리밍:** Ollama API의 `stream: true` 사용.
* **진행률 계산:** 받은 텍스트 길이 / 예상 길이 (3000자 기준).
* **5% 단위 업데이트:** 1%씩 증가 대신 5% 단위로 쾌적하게 표시.
* **완료 시 일괄 표시:** 타이핑 효과 없이 전체 문서를 한 번에 렌더링.
* **깜빡임 방지:** HTML 재렌더링 없이 DOM 요소만 업데이트.

---

## 4. 파일 구조 (리팩토링 완료)

### 📁 전체 구조 (모듈화)
```
src/
├── extension.ts                  # 진입점 (45줄, 커맨드 등록)
├── types/
│   └── index.ts                  # 공통 타입 정의
├── utils/
│   └── shellUtils.ts             # OS별 쉘 명령어 유틸
├── core/
│   └── SpecEngine.ts             # 로직 엔진 (수식 계산)
├── services/
│   ├── ollama/
│   │   ├── OllamaProcessManager.ts   # 프로세스 생명주기 관리
│   │   └── OllamaHealthCheck.ts      # 설치/모델 체크
│   └── ai/
│       ├── PromptTemplates.ts    # 프롬프트 템플릿 (최적화됨)
│       └── AIService.ts          # AI 문서 생성 (Stream)
└── ui/
    └── WebviewProvider.ts        # Webview 관리 (UI + 메시지)
```

### 주요 파일 역할

#### `extension.ts` (진입점, ~45줄)
* 커맨드 등록: `spec-engine.openPreview`
* WebviewProvider 초기화
* 문서/에디터 변경 이벤트 리스너

#### `core/SpecEngine.ts`
* `.spec` 파일 파싱 및 계산
* 함수: sum, avg, max, min, count, filter, map
* if-else 구문 처리

#### `services/ollama/OllamaProcessManager.ts`
* `startOllamaServer()`: 백그라운드 프로세스 시작 (15초 폴링)
* `stopOllamaServer()`: SIGTERM 종료 (Windows: taskkill)
* `scheduleShutdown()`: 5분 타이머 관리

#### `services/ollama/OllamaHealthCheck.ts`
* `isOllamaServerRunning()`: localhost:11434 체크
* `ensureOllamaReady()`: 모델 존재 확인
* `pullModel()`: 터미널에서 모델 다운로드
* `installOllama()`: OS별 설치 스크립트

#### `services/ai/PromptTemplates.ts`
* `SYSTEM_PROMPT`: 최적화된 프롬프트 (디테일 강화 버전)
* Few-shot 예시 포함
* 구조화된 출력 형식 정의

#### `services/ai/AIService.ts`
* `generateDocsWithOllamaStream()`: Ollama Stream API 호출
* 진행률 콜백 (`onProgress`)
* 완료 콜백 (`onComplete`)
* 300ms throttle + 5% 단위 업데이트
* AbortSignal 지원 (취소 기능)

#### `ui/WebviewProvider.ts`
* Webview 생성/관리
* 메시지 핸들링 (triggerAI, cancelAI, downloadMarkdown)
* 실시간 동기화 (`onDidChangeTextDocument`)
* 로딩 UI (스피너, 프로그레스 바, 단계별 메시지)
* GitHub Markdown CSS
* 진행률 업데이트 처리

---

## 5. 현재 상태 (Current Status)

### ✅ 완료된 기능
* **코어 기능:**
    * `.spec` 파일 실시간 로직 계산
    * Ollama 자동 설치/감지
    * AI 기획서 생성 (Stream 모드)
    * Markdown 파일 저장
* **리팩토링:**
    * 438줄 → 8개 모듈로 분리
    * 관심사 분리 (SoC)
    * 테스트 용이성 향상
* **프롬프트 최적화:**
    * 디테일 강화 (2-3배 길이)
    * Few-shot examples
    * 구조화된 출력 형식
* **UI/UX:**
    * 로딩 애니메이션 (스피너 + 프로그레스 바)
    * 단계별 메시지 (4단계 순환)
    * 실시간 진행률 표시 (5% 단위)
    * GitHub Markdown 스타일
    * 깜빡임 없는 부드러운 업데이트
* **기능 개선:**
    * 강제 종료 버튼 (AbortController)
    * Stream 백그라운드 처리
    * 진행률 기반 추정 (텍스트 길이)
    * 마크다운 저장 버그 수정 (HTML → MD)
* **안정화:**
    * Mac/Linux PATH 문제 해결
    * Ollama 프로세스 좀비화 방지
    * 메모리 누수 방지 (Auto-Sleep)

### ⏸️ 보류 기능
* Gemini Cloud API 연동 (dependencies에만 존재, 미사용)

---

## 6. 향후 계획 (Next Steps)

### 배포 준비
* **아이콘 제작:** Extension 마켓플레이스용 아이콘
* **README.md 작성:**
    * 기능 소개
    * 설치 방법
    * 사용 가이드 (스크린샷)
    * 트러블슈팅
* **CHANGELOG.md 업데이트:** 버전별 변경 사항
* **vsce 패키징:** `vsce package` → `.vsix` 파일 생성
* **마켓플레이스 배포:** VS Code Extension Marketplace

### 추가 개선 (선택)
* **Syntax Highlighting:** `.spec` 파일에 대한 문법 하이라이팅
* **다크 모드 최적화:** 테마별 색상 완벽 호환
* **다국어 지원:** 영어 출력 옵션
* **중간 크기 모델 추천:** Qwen 7B, Gemma 9B 가이드
* **설정 UI:** 프롬프트 템플릿 커스터마이징

---

## 7. 성능 지표

### 기획서 생성 속도 (Gemma 2B 기준)
* **짧은 코드 (10줄):** ~8초
* **중간 코드 (30줄):** ~15초
* **긴 코드 (50줄):** ~25초

### 리소스 사용량
* **메모리:** Ollama 실행 시 ~1.8GB (Gemma 2B)
* **디스크:** 모델 다운로드 ~1.6GB
* **CPU:** 생성 중 ~30-50% (Apple Silicon M 시리즈 기준)

### 사용자 경험
* **로직 계산:** 즉시 (< 100ms)
* **AI 생성:** 실시간 진행률 표시
* **렌더링:** 부드러움 (깜빡임 없음)
* **취소:** 즉시 중단 가능

---

## 8. 기술적 특징

### 프롬프트 엔지니어링
* **페르소나:** 10년차 시니어 프로덕트 매니저
* **작성 원칙:** 디테일하게, 구체적으로, 비즈니스 중심, 맥락 제공
* **Few-Shot Learning:** 입력 코드 → 출력 PRD 예시 포함
* **구조화:** 배경 및 목적 → 핵심 로직 → 결과 해석 → 예외 처리

### Stream 최적화
* **Throttle:** 300ms 간격으로 업데이트 (UI 부담 최소화)
* **진행률 추정:** 텍스트 길이 / 3000자 (평균 기획서 길이)
* **5% 단위:** 1%씩 증가 대신 5% 단위로 쾌적함
* **최대 95%:** 완료 전까지 95%를 넘지 않음 (안전 장치)

### 모듈 아키텍처
* **단일 책임 원칙 (SRP):** 각 모듈은 하나의 역할만
* **의존성 역전 (DIP):** 인터페이스/타입으로 결합도 낮춤
* **테스트 용이성:** 각 모듈 독립 테스트 가능

---

**Last Updated:** 2026-02-04
**Version:** 0.1.0 (Production Ready)