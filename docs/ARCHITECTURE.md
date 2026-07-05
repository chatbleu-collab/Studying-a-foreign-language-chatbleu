# ARCHITECTURE — AI Language Coach

> 다중 세션 개발을 전제로 한 구조 지도. 각 파일 상단에도 동일한 목적/의존성 주석이 있다.

## 기술 스택
- React 18 + TypeScript(strict) + Vite 5 (`base: './'` — 하위 경로 배포 대응)
- 런타임 의존성: `react`, `react-dom` **만** (라우터·상태·DB 라이브러리 미사용, 자체 구현)
- 저장: IndexedDB(프로필·SRS·일별로그) + LocalStorage(설정·미션 보너스 플래그)
- 음성: Web Speech API (키 불필요) / AI: Gemini REST(v1beta generateContent)

## 데이터 흐름 한눈에
```
사용자 입력
  → pages/* (화면)
  → engine/* (규칙: 레벨·SRS·적응형 프롬프트·XP)
  → services/* (부수효과: DB·음성·Gemini)
  → store/AppContext (전역 상태 갱신)
```

## 디렉터리 지도

### src/types/models.ts — 모든 타입의 단일 출처
Language, 레벨 체계(EN_LEVELS/JA_LEVELS), LessonMode(13종), CurriculumUnit,
ScriptTurn(`tutor`/`tutorKo`/`expect`/`hint`), VocabItem, SrsCard, QuizQuestion(`explain`=한국어 해설),
ChatMessage, Correction(`explainKo`), LearnerProfile, DailyLog, AppSettings.
**필드명을 바꾸면 전체가 깨지므로 여기서만 정의하고 참조할 것.**

### src/data/ — 콘텐츠 (코드 로직 없음)
- `curriculum.ts` — UNITS: 영어 A0(7)·A1(5)·A2(4)·B1(4)·B2(3), 일본어 N5(5)·N4(4)·N3(3)·N2(2) 단원.
  각 단원 = vocab + patterns + 오프라인 script. 헬퍼 `unitsFor(lang)`, `unitsForLevel(lang, level)`.
- `quizzes.ts` — 문제은행(placement/grammar/toeic/jlpt). 헬퍼 `questionsBy(kind, lang)`.
  **콘텐츠 확장은 이 두 파일에 데이터만 추가하면 UI가 자동 반영.**

### src/engine/ — 순수 로직 (부수효과 없음, 테스트 용이)
- `level.ts` — `scorePlacement`(레벨별 정답률<60%인 첫 레벨), `applyResult`(정확도→progress ±, 100 도달 시 승급), `nextLevel`, `difficultyGuide`(레벨별 발화 난이도 지침), `levelsFor`.
- `srs.ts` — SM-2 간이형: `newCard`/`review(grade 0~3)`/`dueCards`/`todayStr`.
- `adaptive.ts` — `buildTutorSystemPrompt`(프로필→JSON 강제 시스템 프롬프트), `parseTutorJson`,
  `OfflineTutor`(스크립트 진행: opening→respond→done), `SCENARIOS`(롤플레이 5종), `quickCorrect`(규칙 기반 간이 교정).
- `progress.ts` — `XP_TABLE`, `updateStreak`, `appendLog`, `buildReport(logs, 1|7|30)` →
  `Report { totalXp, totalLessons, totalNewWords, totalMinutes, activeDays, topMistakes: string[] }`.

### src/services/ — 부수효과 계층
- `db.ts` — IndexedDB 'ai-language-coach' v1. 스토어: `profile`(key=language) / `srs`(key=card.id) / `logs`(key=`${lang}:${date}`).
  주의: `dbAllCards()` / `dbAllLogs()` 는 **인자 없음** — 호출측에서 language 필터링.
- `settings.ts` — LocalStorage 'alc-settings-v1'. `DEFAULT_SETTINGS`(geminiModel 'gemini-2.0-flash', theme 'dark', ttsRate 0.85).
- `speech.ts` — `speak`/`listenOnce`(미지원 시 reject→호출측 텍스트 폴백)/`pronunciationScore`(단어 일치율 0~100)/`sttAvailable`/`ttsAvailable`.
- `ai.ts` — `providerStatus()`(gemini|offline), `askGemini(system, history, text)` — 실패 시 throw → 호출측이 오프라인 폴백.

### src/store/AppContext.tsx — 전역 상태 + 상태 기반 라우팅
`Route` 유니언 타입(home/onboarding/conversation/quiz/audio/progress/settings).
`recordActivity(xp, extra)` 가 XP·스트릭·DailyLog 를 한 번에 갱신하는 **유일한 통로**.

### src/pages/ — 화면 (모드 통합 설계)
- `Onboarding.tsx` — 언어 선택→배치 테스트→로드맵. 완료 시 profile 생성(placementDone).
- `Home.tsx` — 스탯/일일 미션(오늘 로그 기반 3목표+보너스 1회)/12모드 그리드/롤플레이·여행 시나리오 시트.
- `Conversation.tsx` — free/guided/role-play/travel 통합. Gemini↔OfflineTutor 자동 폴백,
  TTS·STT, 교정 표시, 신규 단어 SRS 자동 등록, 가이드 레슨 완료 시 진도·승급·단원 전진.
- `Quiz.tsx` — vocab(SRS 플래시카드, 세션 10장, 부족 시 현재 레벨 어휘로 새 카드 보충) / grammar / jlpt / toeic.
- `AudioPractice.tsx` — pronunciation(따라 말하기 채점)/listening(받아쓰기)/speaking-challenge(길게 말하기).
- `Progress.tsx` — 오늘/7일/30일 리포트 + 프로필 요약.
- `Settings.tsx` — Gemini 키·모델, 테마, TTS 속도, 언어 재시작, 전체 초기화.

### 루트
- `App.tsx` — route 스위치 + 하단 탭(홈/리포트/설정). **새 탭·외부 링크 없음.**
- `main.tsx` — 렌더 + SW 등록(상대경로 'sw.js').
- `styles.css` — CSS 변수 테마(`html[data-theme]`), 모바일 퍼스트, max-width 560px.

### public/
- `manifest.webmanifest` — start_url/scope `./`, standalone.
- `sw.js` — 사전캐시(앱 셸) + 런타임 캐시(해시 자산) + 네비게이션 네트워크 우선.
- `icons/` — 192/512 PNG.

## 불변 규칙 (다음 세션에서도 유지할 것)
1. 새 탭 금지: `target="_blank"`, `window.open` 사용 금지. 외부 URL 은 복사 텍스트로 안내.
2. 상대 경로: vite `base: './'`, SW 등록 'sw.js', 매니페스트 `./`.
3. API 키를 코드에 넣지 않는다. 사용자 입력 키만 LocalStorage 에 저장.
4. 튜터는 학습자 레벨을 넘는 난이도로 말하지 않는다 — `difficultyGuide` + 시스템 프롬프트가 강제.
5. XP/로그 갱신은 반드시 `recordActivity` 경유.
