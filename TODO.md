# MVP Todo List

## MVP 범위 정의

### 포함 (In Scope)
- [x] 프로젝트 셋업 (Next.js + Tailwind + Zustand)
- [x] 메인 화면 (캐릭터 목록 + 거실 프리뷰)
- [x] 캐릭터 상세 모달
- [x] 1:1 채팅 (OpenRouter 연동)
- [ ] 채팅 기록 저장 (Supabase) - 로컬스토리지로 대체 완료
- [x] 그룹 채팅 (2-3명 캐릭터)
- [x] 관전 모드 (캐릭터끼리 자동 대화)

### 제외 (Out of Scope) - v2
- 사용자 인증/로그인
- 캐릭터 기억 시스템 (장기 기억)
- 캐릭터 관계 변화 시스템
- 상황/장소 설정 (연출 모드)
- 즐겨찾기 기능
- 알림 기능
- 다크/라이트 모드 전환

---

## Phase 1: 기본 인프라 ✅ 완료

- [x] Next.js 14 프로젝트 생성
- [x] Tailwind CSS 설정
- [x] 폴더 구조 생성
- [x] 타입 정의 (Character, Chat, Message)
- [x] Zustand 스토어 설정
- [x] 캐릭터 데이터 JSON 생성
- [x] 캐릭터 이미지 public 폴더에 배치

---

## Phase 2: UI 컴포넌트 ✅ 완료

### 2-1. 레이아웃
- [x] Header 컴포넌트
- [x] BottomNav 컴포넌트
- [x] 반응형 레이아웃

### 2-2. 캐릭터
- [x] CharacterCard 컴포넌트
- [x] CharacterGrid 컴포넌트
- [x] CharacterModal 컴포넌트

### 2-3. 채팅
- [x] LiveChatPreview 컴포넌트
- [x] ChatBubble 컴포넌트
- [x] ChatInput 컴포넌트
- [x] TypingIndicator 컴포넌트

---

## Phase 3: Supabase 연동 ⏸️ 스킵 (로컬스토리지 사용)

> MVP에서는 Zustand persist로 로컬스토리지에 저장
> Supabase 연동은 v2에서 진행

---

## Phase 4: 1:1 채팅 ✅ 완료

### 4-1. 채팅 페이지
- [x] /chat/[characterId] 페이지 생성
- [x] 채팅 UI 구현
- [x] 메시지 입력/전송 기능
- [x] 스크롤 자동 이동

### 4-2. OpenRouter 연동
- [x] API Route 구현 (/api/chat)
- [x] 스트리밍 응답 구현
- [x] 캐릭터별 시스템 프롬프트 적용
- [x] Mock 응답 (API 키 없을 때)
- [x] 에러 핸들링

### 4-3. 메시지 저장
- [x] Zustand persist로 로컬 저장
- [x] 채팅 기록 불러오기

---

## Phase 5: 그룹 채팅 ✅ 완료

### 5-1. 그룹 채팅 페이지
- [x] /chat/group 페이지 생성
- [x] 기본 참여 캐릭터 (민수, 하나, 유진)
- [x] 멀티 캐릭터 채팅 버블

### 5-2. 멀티 캐릭터 응답
- [x] 캐릭터 순차 응답 로직
- [x] 각 캐릭터 개별 API 호출
- [x] 스트리밍 응답

---

## Phase 6: 관전 모드 ✅ 완료

### 6-1. 관전 모드 페이지
- [x] /chat/spectate 페이지 생성
- [x] 자동 대화 생성 로직 (5초 간격)
- [x] 랜덤 캐릭터 선택

### 6-2. 끼어들기 기능
- [x] "끼어들기" 버튼 → 그룹 채팅으로 이동
- [x] 일시정지/재개 기능
- [x] 배속 조절 (0.5x ~ 3x)

---

## Phase 7: 마무리

### 7-1. 테스트
- [ ] 전체 플로우 테스트
- [ ] 모바일 반응형 테스트
- [ ] 에러 케이스 테스트

### 7-2. 배포
- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정 (OPENROUTER_API_KEY)
- [ ] 프로덕션 배포

---

## 현재 진행 상황

```
Phase 1 ████████████████████ 100% ✅
Phase 2 ████████████████████ 100% ✅
Phase 3 ░░░░░░░░░░░░░░░░░░░░ SKIP (v2)
Phase 4 ████████████████████ 100% ✅
Phase 5 ████████████████████ 100% ✅
Phase 6 ████████████████████ 100% ✅
Phase 7 ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 구현 완료된 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 (거실 + 캐릭터 목록) |
| `/chat` | 채팅 목록 |
| `/chat/[characterId]` | 1:1 채팅 |
| `/chat/group` | 그룹 채팅 |
| `/chat/spectate` | 관전 모드 |

---

## 다음 할 일

1. **OpenRouter API 키 설정** → .env.local에 실제 키 입력
2. **테스트** → 전체 플로우 확인
3. **Vercel 배포** → 프로덕션 배포

---

## 실행 방법

```bash
cd /Users/taesupyoon/Desktop/character-chat-app
npm run dev
# http://localhost:3001
```
