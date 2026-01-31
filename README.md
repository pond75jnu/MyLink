# SmartLink - AI 기반 링크 관리 웹앱

AI가 자동으로 링크를 분석하여 제목 생성, 내용 요약, 카테고리 분류를 수행하는 개인 링크 관리 서비스입니다.

## 주요 기능

- **자동 분석**: 링크만 저장하면 AI가 알아서 콘텐츠 분석
- **스마트 분류**: 자동 카테고리 생성 및 분류
- **빠른 검색**: 키워드 및 카테고리 기반 빠른 검색
- **완전한 제어**: 사용자가 모든 정보를 수정 가능

## 기술 스택

- **프론트엔드**: Vite + React 18 + TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: Zustand
- **데이터베이스**: Supabase (PostgreSQL)
- **AI**: OpenAI API (gpt-4o)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env`로 복사하고 값을 채워넣습니다.

### 3. 데이터베이스 설정

1. [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성 (프로젝트명: `mylink` 권장)
2. SQL Editor에서 `database/schema.sql` 실행 (스키마 + RLS 정책 포함)

> **RLS 정책**: 스키마에 포함된 `Allow all for anon` 정책이 자동으로 적용됩니다.

### 4. 관리자 계정

로컬 환경(localhost, 127.0.0.1)에서 `pond75@naver.com` 이메일로 회원가입 시 자동으로 관리자(admin) 권한이 부여됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

### 6. 빌드

```bash
npm run build
```

## 프로젝트 구조

```
├── database/           # SQL 스키마 파일
├── src/
│   ├── components/     # React 컴포넌트
│   ├── hooks/          # 커스텀 훅
│   ├── lib/            # 유틸리티 및 설정
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # API 서비스
│   ├── stores/         # Zustand 스토어
│   └── types/          # TypeScript 타입
├── public/             # 정적 파일
└── .env.example        # 환경변수 예시
```

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_OPENAI_API_KEY` | OpenAI API 키 |

## 라이선스

MIT
