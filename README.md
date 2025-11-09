# 🚀 노션 스타일 협업 에디터

Slate.js와 Yjs를 활용한 실시간 협업 블록 에디터입니다. CRDT(Conflict-free Replicated Data Type) 기술을 사용하여 여러 사용자가 노션처럼 동시에 문서를 편집할 수 있습니다.

## ✨ 주요 기능

### 🧱 블록 기반 에디터
- **다양한 블록 타입**: 텍스트, 제목(H1-H3), 리스트, 할일, 토글, 인용, 코드, 구분선
- **슬래시 커맨드(/)**: 노션처럼 `/` 입력으로 블록 메뉴 열기
- **키보드 네비게이션**: 화살표 키로 메뉴 탐색, Enter로 선택

### 🤝 실시간 협업
- **CRDT 기반 동기화**: 충돌 없는 자동 병합
- **협업 커서**: 다른 사용자의 커서 위치 표시
- **실시간 사용자 수**: 현재 접속 중인 사용자 확인

### 🎨 노션 스타일 UI
- 깔끔한 미니멀 디자인
- 인터랙티브 블록 (체크박스, 토글)
- 텍스트 포맷팅 (Bold, Italic, Code 등)

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Editor Framework**: Slate.js + slate-react
- **CRDT Library**: Yjs + @slate-yjs/core
- **Sync Provider**: y-websocket
- **WebSocket Server**: ws (Node.js)
- **Icons**: lucide-react

## 📋 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

이 명령어는 다음 두 가지를 동시에 실행합니다:
- WebSocket 서버 (포트 1234)
- React 개발 서버 (포트 5173)

### 3. 브라우저에서 접속

```
http://localhost:5173
```

## 🧪 사용 방법

### 1. 블록 추가하기
- `/` 를 입력하면 블록 메뉴가 나타납니다
- 화살표 키로 원하는 블록 선택
- Enter 키로 블록 생성

### 2. 지원되는 블록
- **텍스트**: 일반 텍스트 단락
- **제목 1, 2, 3**: 다양한 크기의 제목
- **글머리 기호/번호 매기기 목록**: 순서 있는/없는 리스트
- **할 일**: 체크박스로 작업 관리
- **토글**: 접었다 펼칠 수 있는 섹션
- **인용**: 인용구 스타일
- **코드**: 코드 블록
- **구분선**: 섹션 구분

### 3. 협업 테스트
1. 브라우저에서 `http://localhost:5173` 접속
2. 새 탭이나 다른 브라우저에서 같은 URL 접속
3. 한 쪽에서 편집하면 다른 쪽에서 실시간 반영!

## 📁 프로젝트 구조

```
crdt-yjs-ywebsocket/
├── server/
│   └── index.ts              # WebSocket 서버
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   └── NotionEditor.tsx     # 메인 에디터
│   │   ├── Blocks/
│   │   │   ├── BlockRenderer.tsx    # 블록 렌더러
│   │   │   ├── ParagraphBlock.tsx
│   │   │   ├── HeadingBlock.tsx
│   │   │   ├── TodoBlock.tsx
│   │   │   ├── ToggleBlock.tsx
│   │   │   └── ... (기타 블록들)
│   │   └── SlashMenu/
│   │       └── SlashCommandMenu.tsx # 슬래시 커맨드
│   ├── lib/
│   │   └── slate-yjs-config.ts      # Slate + Yjs 설정
│   ├── types/
│   │   └── blocks.ts                # 블록 타입 정의
│   ├── App.tsx
│   ├── NotionEditor.css             # 노션 스타일
│   └── main.tsx
├── package.json
└── README.md
```

## 🔍 CRDT란?

CRDT(Conflict-free Replicated Data Type)는 분산 시스템에서 여러 복제본 간의 동기화 문제를 해결하기 위한 데이터 구조입니다.

### 핵심 특징

1. **강한 최종 일관성**: 모든 복제본이 같은 업데이트를 받으면 결국 같은 상태로 수렴
2. **충돌 자동 해결**: 동시 편집 시 충돌이 발생하지 않도록 수학적으로 설계
3. **오프라인 우선**: 네트워크 연결 없이도 작업 가능

### Yjs의 Y.Text

이 프로젝트는 Yjs의 `Y.Text` 타입을 사용합니다:

```typescript
const yText = doc.getText('shared-text')

// 텍스트 삽입
yText.insert(0, 'Hello World')

// 텍스트 삭제
yText.delete(0, 5)

// 전체 텍스트 가져오기
const content = yText.toString()
```

## 🎯 동작 원리

### 1. 문서 생성 및 공유

```typescript
// 각 클라이언트가 Yjs 문서 생성
const doc = new Y.Doc()
const yText = doc.getText('shared-text')
```

### 2. WebSocket Provider 연결

```typescript
// WebSocket을 통해 서버와 연결
const provider = new WebsocketProvider(
  'ws://localhost:1234',
  'my-document',
  doc
)
```

### 3. 변경사항 감지 및 동기화

```typescript
// 로컬 변경사항 → Yjs → WebSocket → 다른 클라이언트
yText.observe(() => {
  // 변경사항 처리
})
```

### 4. Awareness (사용자 상태 공유)

```typescript
// 현재 사용자 정보 설정
provider.awareness.setLocalStateField('user', {
  name: '사용자 이름',
  color: '#FF6B6B'
})

// 다른 사용자 상태 변경 감지
provider.awareness.on('change', () => {
  const states = provider.awareness.getStates()
  // 접속 중인 사용자 목록 업데이트
})
```

## 📚 추가 학습 자료

- [Yjs 공식 문서](https://docs.yjs.dev/)
- [y-websocket GitHub](https://github.com/yjs/y-websocket)
- [CRDT 기술 소개](https://crdt.tech/)

## 🔧 커스터마이징

### 문서 이름 변경

`src/components/CollaborativeEditor.tsx`에서 문서 이름을 변경할 수 있습니다:

```typescript
const wsProvider = new WebsocketProvider(
  'ws://localhost:1234',
  'my-custom-document', // 여기를 변경
  doc
)
```

### 서버 포트 변경

- WebSocket 서버: `server/index.ts`의 `PORT` 상수 수정
- React 개발 서버: `vite.config.ts`의 `server.port` 수정

## 🐛 문제 해결

### 연결이 안 될 때

1. WebSocket 서버가 실행 중인지 확인
2. 포트 1234가 사용 가능한지 확인
3. 방화벽 설정 확인

### 동기화가 안 될 때

1. 브라우저 콘솔에서 에러 확인
2. 네트워크 탭에서 WebSocket 연결 상태 확인
3. 같은 문서 이름을 사용하는지 확인

## 📄 라이선스

MIT

## 👨‍💻 개발자

CRDT 샘플 프로젝트 - Yjs와 y-websocket을 활용한 협업 에디터

---

**즐거운 협업 코딩 되세요! 🚀**
