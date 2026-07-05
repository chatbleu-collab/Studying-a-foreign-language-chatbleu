/*
 * engine/level.ts — 레벨 추정·승급 엔진
 * 목적: (1) 배치 테스트 채점 → 시작 레벨 추정, (2) 학습 성과 → levelProgress 갱신·승급 판단,
 *       (3) 현재 레벨에 맞는 난이도 지침 문자열 생성(AI 프롬프트/오프라인 엔진 공용).
 * 의존성: types/models.ts
 * 핵심 철학: 학습자 수준보다 크게 높은 출력을 절대 내지 않는다(comprehensible input).
 */
import { EN_LEVELS, JA_LEVELS, Language, LevelCode, QuizQuestion } from '../types/models';

export function levelsFor(language: Language): LevelCode[] {
  return language === 'en' ? EN_LEVELS : JA_LEVELS;
}

/**
 * 배치 테스트 채점.
 * 규칙: 낮은 레벨부터 순서대로, 해당 레벨 문항 정답률이 60% 이상이면 그 레벨을 "통과"로 간주.
 * 처음으로 통과하지 못한 레벨이 시작 레벨이 된다. 전부 통과하면 최고 레벨.
 */
export function scorePlacement(
  language: Language,
  questions: QuizQuestion[],
  answers: number[]
): LevelCode {
  const levels = levelsFor(language);
  for (const level of levels) {
    const idxs = questions
      .map((q, i) => (q.level === level ? i : -1))
      .filter((i) => i >= 0);
    if (idxs.length === 0) continue;
    const correct = idxs.filter((i) => answers[i] === questions[i].answer).length;
    if (correct / idxs.length < 0.6) return level; // 이 레벨부터 학습 시작
  }
  return levels[levels.length - 1];
}

/** 다음 레벨 코드 (최고 레벨이면 그대로) */
export function nextLevel(language: Language, current: LevelCode): LevelCode {
  const levels = levelsFor(language);
  const i = levels.indexOf(current);
  return i >= 0 && i < levels.length - 1 ? levels[i + 1] : current;
}

/**
 * 학습 결과를 levelProgress(0~100)에 반영.
 * 반환: { progress, promoted } — 100 도달 시 승급 신호.
 * 정답률이 매우 낮으면 progress 를 소폭 감소시켜 난이도를 유지한다(강등은 하지 않음).
 */
export function applyResult(progress: number, accuracy: number): { progress: number; promoted: boolean } {
  let delta: number;
  if (accuracy >= 0.9) delta = 12;
  else if (accuracy >= 0.7) delta = 8;
  else if (accuracy >= 0.5) delta = 4;
  else delta = -3;
  const p = Math.max(0, progress + delta);
  if (p >= 100) return { progress: 0, promoted: true };
  return { progress: p, promoted: false };
}

/** 레벨별 튜터 발화 난이도 지침 — AI 시스템 프롬프트와 UI 안내에 공용 */
export function difficultyGuide(language: Language, level: LevelCode): string {
  if (language === 'en') {
    switch (level) {
      case 'A0': return '문장당 5~8단어, 현재시제 위주, 가장 기초적인 어휘만 사용. 새 단어는 한 번에 1~2개.';
      case 'A1': return '문장당 8~12단어, 현재/과거 시제, 일상 어휘. 새 단어는 한 번에 2~3개.';
      case 'A2': return '복문 일부 허용, 현재완료·미래 표현 도입. 새 단어 2~3개 + 짧은 관용구 1개.';
      case 'B1': return '자연스러운 복문, 수동태·간접화법 허용. 학습자 발화를 더 길게 유도.';
      default: return '원어민에 가까운 자연스러운 표현, 관용구·뉘앙스 지도. 논증 구조 피드백 제공.';
    }
  }
  switch (level) {
    case 'N5': return 'かな 중심 표기 + 로마자 병기, です/ます형만 사용, 문장당 어절 4~6개. 새 단어 1~2개.';
    case 'N4': return '기초 한자 소량 + 후리가나 개념 설명, 과거형·희망형 도입. 새 단어 2~3개.';
    case 'N3': return '접속사로 문장 연결, 보통형 도입. 학습자 발화 2문장 이상 유도.';
    default: return '경어·비즈니스 표현, 신문 수준 어휘 일부. 뉘앙스와 격식 차이 지도.';
  }
}
