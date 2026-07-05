/*
 * engine/srs.ts — 간격 반복(SRS) 엔진 (SM-2 간이형)
 * 목적: 어휘 카드의 복습 간격 계산. "다시(0) / 어려움(1) / 좋음(2) / 쉬움(3)" 4단계 평가.
 * 의존성: types/models.ts
 * 저장: services/db.ts 의 'srs' 스토어에 카드 단위로 저장된다.
 */
import { Language, SrsCard, VocabItem } from '../types/models';

const DAY = 24 * 60 * 60 * 1000;

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 새 카드 생성 — 오늘 즉시 복습 대상 */
export function newCard(language: Language, item: VocabItem): SrsCard {
  return {
    id: `${language}:${item.word}`,
    language,
    item,
    interval: 0,
    ease: 2.5,
    reps: 0,
    due: todayStr(),
    learnedAt: todayStr()
  };
}

/**
 * 복습 결과 반영 (SM-2 간이형).
 * grade: 0=다시(즉시 재출제) 1=어려움 2=좋음 3=쉬움
 */
export function review(card: SrsCard, grade: 0 | 1 | 2 | 3): SrsCard {
  const c = { ...card };
  if (grade === 0) {
    c.reps = 0;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.due = todayStr(); // 오늘 다시
    return c;
  }
  c.reps += 1;
  if (c.reps === 1) c.interval = 1;
  else if (c.reps === 2) c.interval = 3;
  else c.interval = Math.round(c.interval * c.ease);

  if (grade === 1) c.ease = Math.max(1.3, c.ease - 0.15);
  if (grade === 3) c.ease = c.ease + 0.1;

  c.due = todayStr(new Date(Date.now() + c.interval * DAY));
  return c;
}

/** 오늘 복습 대상 필터 (due <= 오늘) */
export function dueCards(cards: SrsCard[]): SrsCard[] {
  const t = todayStr();
  return cards.filter((c) => c.due <= t);
}
