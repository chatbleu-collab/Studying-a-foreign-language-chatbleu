# CONTINUATION — 다음 세션 재개 가이드

> 새 Claude 세션(또는 다른 개발자)이 이 문서만 읽고 바로 이어서 작업할 수 있도록 작성.

## 현재 상태 (v1.0 — 2026-07-05)

✅ **빌드 통과** (`npm run build` = tsc strict + vite, 오류 0)
✅ 전 기능 구현 완료: 온보딩/배치테스트, 12 레슨 모드, SRS, 진도 리포트, 설정, PWA(SW+매니페스트+아이콘), 다크/라이트 테마, Gemini↔오프라인 폴백, TTS/STT+텍스트 폴백

## 재개 절차

```bash
cd ai-language-coach
npm install        # node_modules 없을 때만
npm run dev        # 확인
npm run build      # 수정 후 반드시 통과시킬 것
```

1. `docs/ARCHITECTURE.md` 를 먼저 읽는다 (파일 지도 + 불변 규칙 5개).
2. 타입 변경은 `src/types/models.ts` 에서만.
3. 콘텐츠 추가는 `src/data/curriculum.ts`, `src/data/quizzes.ts` 에 데이터만 추가 — UI 자동 반영.

## 확장 백로그 (우선순위순)

| # | 작업 | 위치 | 난이도 |
|---|---|---|---|
| 1 | 상위 레벨(B1/B2, N3/N2) 단원·스크립트 확충 | data/curriculum.ts | 하 (데이터만) |
| 2 | 문제은행 확충 (문법/TOEIC/JLPT 각 20문항+) | data/quizzes.ts | 하 (데이터만) |
| 3 | 일본어 かな 표시 토글(로마자 병기) | Conversation.tsx + settings | 중 |
| 4 | 발음 채점 고도화(음절 단위 비교) | services/speech.ts pronunciationScore | 중 |
| 5 | 주간 목표 설정 UI(현재 미션 3종 고정) | Home.tsx + settings | 중 |
| 6 | 리포트 차트(막대 그래프, 순수 CSS/SVG) | Progress.tsx | 중 |
| 7 | 대화 내역 저장/다시보기 | db.ts 스토어 추가 + 페이지 | 중 |
| 8 | 영어↔일본어 동시 학습(프로필 전환 UI) | AppContext + Settings | 중 |
| 9 | Gemini 스트리밍 응답 | services/ai.ts | 상 |

## 주의사항 (이번 세션에서 실제로 밟은 함정)

- `dbAllCards()` / `dbAllLogs()` 는 인자를 받지 않는다 → 호출측에서 `.filter(c => c.language === ...)`.
- `ScriptTurn` 의 발화 필드는 `tutor` (~~text~~ 아님).
- `QuizQuestion` 해설 필드는 `explain` (~~explainKo~~ 아님) — Correction 쪽이 `explainKo`.
- `buildReport` 반환은 `totalXp/totalLessons/totalNewWords`, `topMistakes: string[]`.
- SW 캐시 버전은 `public/sw.js` 의 `CACHE_VERSION` — 배포 시 캐시 문제가 보이면 버전 문자열을 올릴 것.

## 배포 방법 (사용자 안내용)

1. `dist/` 폴더 내용물을 GitHub Pages / Netlify / Vercel 등 **HTTPS** 정적 호스팅에 업로드.
2. 스마트폰 Chrome 에서 접속 → 메뉴 → "홈 화면에 추가".
3. Gemini 키는 앱 설정 화면에서 사용자가 직접 입력(코드/저장소에 절대 포함 금지).

## 자동 배포 (2026-07-05 추가)

`.github/workflows/deploy.yml` — main 브랜치 push 시 자동으로 `npm ci → npm run build → dist/ 배포`.
저장소 Settings → Pages → Source 를 **"GitHub Actions"** 로 설정해야 작동한다.
`.gitignore` 로 node_modules/dist 는 저장소에 올리지 않는다 (Actions 가 매번 빌드).
