/*
 * engine/progress.ts — 진도·XP·스트릭·리포트 엔진
 * 목적: 학습 활동 → XP/스트릭 반영, 일별 로그 누적, 일/주/월 리포트 집계.
 * 의존성: types/models.ts, engine/srs.ts(todayStr)
 * 저장: services/db.ts 'logs' 스토어 (date 키).
 */
import { DailyLog, LearnerProfile } from '../types/models';
import { todayStr } from './srs';

/** 활동별 XP 표 — 밸런스 조정은 여기서만 */
export const XP_TABLE = {
  lessonComplete: 30,
  quizCorrect: 5,
  vocabReview: 3,
  conversationTurn: 2,
  pronunciationTry: 4,
  dailyMission: 40,
  placementDone: 20
} as const;

/** 스트릭 갱신 — 오늘 처음 학습하면 +1, 하루 이상 건너뛰었으면 1로 리셋 */
export function updateStreak(profile: LearnerProfile): LearnerProfile {
  const today = todayStr();
  if (profile.lastStudyDate === today) return profile;
  const yesterday = todayStr(new Date(Date.now() - 86400000));
  const streak = profile.lastStudyDate === yesterday ? profile.streak + 1 : 1;
  return { ...profile, streak, lastStudyDate: today };
}

/** 오늘 로그에 활동 누적 (없으면 새로 생성) */
export function appendLog(
  existing: DailyLog | undefined,
  language: LearnerProfile['language'],
  delta: Partial<Pick<DailyLog, 'xp' | 'lessons' | 'newWords' | 'minutes'>>,
  mistake?: string
): DailyLog {
  const log: DailyLog = existing ?? {
    date: todayStr(), language, xp: 0, lessons: 0, newWords: 0, mistakes: [], minutes: 0
  };
  return {
    ...log,
    xp: log.xp + (delta.xp ?? 0),
    lessons: log.lessons + (delta.lessons ?? 0),
    newWords: log.newWords + (delta.newWords ?? 0),
    minutes: log.minutes + (delta.minutes ?? 0),
    mistakes: mistake ? [...log.mistakes.slice(-19), mistake] : log.mistakes
  };
}

export interface Report {
  periodLabel: string;
  days: number;
  totalXp: number;
  totalLessons: number;
  totalNewWords: number;
  totalMinutes: number;
  activeDays: number;
  topMistakes: string[];
}

/** 최근 N일 로그를 집계해 리포트 생성 (daily=1, weekly=7, monthly=30) */
export function buildReport(logs: DailyLog[], days: 1 | 7 | 30): Report {
  const from = todayStr(new Date(Date.now() - (days - 1) * 86400000));
  const inRange = logs.filter((l) => l.date >= from);
  const mistakes: Record<string, number> = {};
  for (const l of inRange) for (const m of l.mistakes) mistakes[m] = (mistakes[m] ?? 0) + 1;
  const topMistakes = Object.entries(mistakes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m]) => m);
  return {
    periodLabel: days === 1 ? '오늘' : days === 7 ? '최근 7일' : '최근 30일',
    days,
    totalXp: inRange.reduce((s, l) => s + l.xp, 0),
    totalLessons: inRange.reduce((s, l) => s + l.lessons, 0),
    totalNewWords: inRange.reduce((s, l) => s + l.newWords, 0),
    totalMinutes: inRange.reduce((s, l) => s + l.minutes, 0),
    activeDays: inRange.length,
    topMistakes
  };
}
