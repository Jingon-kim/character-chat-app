# Architecture

## Tech Stack

| 영역 | 기술 | 이유 |
|------|------|------|
| **Frontend** | Next.js 14 (App Router) | SSR, 라우팅, API Routes 통합 |
| **Styling** | Tailwind CSS | 빠른 UI 개발, 반응형 |
| **State** | Zustand | 간단한 전역 상태 관리 |
| **DB** | Supabase | 실시간 DB, 인증, 스토리지 |
| **AI** | OpenRouter | 멀티 모델 지원 (Claude, GPT 등) |
| **Deploy** | Vercel | Next.js 최적화, 자동 배포 |

---

## 폴더 구조

```
chracter-chat/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 공통 레이아웃
│   ├── page.tsx            # 메인 (거실)
│   ├── chat/
│   │   ├── [roomId]/
│   │   │   └── page.tsx    # 채팅방
│   │   └── page.tsx        # 채팅 목록
│   └── api/
│       ├── chat/
│       │   └── route.ts    # AI 채팅 API
│       └── characters/
│           └── route.ts    # 캐릭터 데이터 API
│
├── components/
│   ├── ui/                 # 공통 UI (Button, Modal 등)
│   ├── chat/
│   │   ├── ChatRoom.tsx    # 채팅방 컴포넌트
│   │   ├── ChatBubble.tsx  # 메시지 버블
│   │   └── ChatInput.tsx   # 입력창
│   ├── character/
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterModal.tsx
│   │   └── CharacterGrid.tsx
│   └── layout/
│       ├── Header.tsx
│       └── BottomNav.tsx
│
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── openrouter.ts       # OpenRouter API 래퍼
│   └── utils.ts            # 유틸리티 함수
│
├── stores/
│   ├── chatStore.ts        # 채팅 상태
│   └── characterStore.ts   # 캐릭터 상태
│
├── types/
│   ├── character.ts        # 캐릭터 타입
│   ├── chat.ts             # 채팅 타입
│   └── database.ts         # Supabase 타입
│
├── data/
│   └── characters.json     # 캐릭터 기본 데이터
│
├── characters/             # 캐릭터 이미지 (public으로 이동 예정)
│
└── public/
    └── characters/         # 캐릭터 이미지
```

---

## Supabase 스키마

### characters (캐릭터 마스터)
```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  age INTEGER,
  occupation TEXT,
  mbti TEXT,
  personality JSONB,
  speech_style JSONB,
  system_prompt TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### chat_rooms (채팅방)
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('single', 'group', 'spectate')),
  character_ids TEXT[],
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### messages (메시지)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'character')),
  sender_id TEXT,  -- user_id 또는 character_id
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 실시간 구독용 인덱스
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### character_relationships (캐릭터 관계)
```sql
CREATE TABLE character_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_a TEXT REFERENCES characters(id),
  character_b TEXT REFERENCES characters(id),
  relationship_type TEXT,  -- friend, crush, rival 등
  affinity INTEGER DEFAULT 50,  -- 0-100 친밀도
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_character_memory (유저-캐릭터 기억)
```sql
CREATE TABLE user_character_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  character_id TEXT REFERENCES characters(id),
  memory_summary TEXT,  -- AI가 요약한 대화 기억
  affinity INTEGER DEFAULT 50,
  last_chat_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, character_id)
);
```

---

## API 설계

### 1. 채팅 API

**POST /api/chat**
```typescript
// Request
{
  roomId: string;
  message: string;
  characterIds: string[];  // 응답할 캐릭터들
}

// Response (스트리밍)
{
  characterId: string;
  content: string;
  done: boolean;
}
```

### 2. OpenRouter 연동

```typescript
// lib/openrouter.ts
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateCharacterResponse({
  character,
  messages,
  userMessage,
  otherCharacters,
}: {
  character: Character;
  messages: Message[];
  userMessage: string;
  otherCharacters?: Character[];
}) {
  const systemPrompt = buildSystemPrompt(character, otherCharacters);

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',  // 또는 다른 모델
      messages: [
        { role: 'system', content: systemPrompt },
        ...formatMessages(messages),
        { role: 'user', content: userMessage },
      ],
      stream: true,
    }),
  });

  return response;
}
```

---

## 핵심 플로우

### 1. 1:1 채팅 플로우
```
User Input
    ↓
Next.js API Route (/api/chat)
    ↓
OpenRouter API (with character system prompt)
    ↓
Stream Response → Client
    ↓
Supabase에 메시지 저장
```

### 2. 그룹 채팅 플로우
```
User Input (또는 자동 트리거)
    ↓
Next.js API Route
    ↓
캐릭터 순서 결정 (랜덤 or 관계 기반)
    ↓
각 캐릭터별 OpenRouter 호출 (순차)
    ↓
Stream Response → Client
    ↓
Supabase에 메시지 저장
```

### 3. 관전 모드 플로우
```
관전 모드 시작
    ↓
5초마다 자동 트리거
    ↓
랜덤 캐릭터 선택 → OpenRouter 호출
    ↓
캐릭터 응답 → 다음 캐릭터 반응 트리거
    ↓
유저 "끼어들기" → 일반 채팅으로 전환
```

---

## 환경 변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
```

---

## MVP 구현 순서

| 순서 | 작업 | 예상 복잡도 |
|------|------|-------------|
| 1 | Next.js 프로젝트 셋업 + Tailwind | 낮음 |
| 2 | Supabase 연동 + 스키마 생성 | 낮음 |
| 3 | 캐릭터 목록 UI | 낮음 |
| 4 | 1:1 채팅 (OpenRouter 연동) | 중간 |
| 5 | 채팅 기록 저장/불러오기 | 낮음 |
| 6 | 그룹 채팅 | 중간 |
| 7 | 관전 모드 | 높음 |
| 8 | 캐릭터 기억 시스템 | 높음 |

---

## 추후 고려사항

- [ ] 인증 (Supabase Auth)
- [ ] 실시간 타이핑 인디케이터
- [ ] 캐릭터 감정 상태 시각화
- [ ] 이미지 메시지 지원
- [ ] 음성 대화 (TTS/STT)
