/*
 * pages/Progress.tsx — 학습 리포트 (오늘 · 최근 7일 · 최근 30일)
 * 동작: IndexedDB logs 스토어 전체를 읽어 engine/progress.buildReport 로 집계 표시.
 *       프로필 요약(레벨/XP/스트릭/누적 레슨·단어/발음 평균/약점 상위)도 함께 보여준다.
 * 의존성: services/db.ts, engine/progress.ts, store/AppContext.tsx
 */
import React, { useEffect, useState } from 'react';
import { DailyLog } from '../types/models';
import { dbAllLogs } from '../services/db';
import { buildReport } from '../engine/progress';
import { useApp } from '../store/AppContext';
import { Card, Header, ProgressBar } from '../components/ui';

export default function Progress() {
  const { profile } = useApp();
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    if (profile) void dbAllLogs().then((all) => setLogs(all.filter((l) => l.language === profile.language)));
  }, [profile]);

  if (!profile) return <div className="page"><Header title="📊 학습 리포트" /><p className="muted">프로필이 없어요.</p></div>;

  const day = buildReport(logs, 1);
  const week = buildReport(logs, 7);
  const month = buildReport(logs, 30);
  const avgPron = profile.pronunciationScores.length
    ? Math.round(profile.pronunciationScores.reduce((a, b) => a + b, 0) / profile.pronunciationScores.length)
    : null;

  const Section = ({ title, r }: { title: string; r: ReturnType<typeof buildReport> }) => (
    <Card>
      <b>{title}</b>
      <div className="stat-row">
        <div className="stat"><div className="stat-num">{r.totalXp}</div><div className="muted small">XP</div></div>
        <div className="stat"><div className="stat-num">{r.totalLessons}</div><div className="muted small">레슨</div></div>
        <div className="stat"><div className="stat-num">{r.totalNewWords}</div><div className="muted small">새 단어</div></div>
        <div className="stat"><div className="stat-num">{r.activeDays}</div><div className="muted small">학습일</div></div>
      </div>
      {r.topMistakes.length > 0 && (
        <>
          <div className="muted small">자주 틀린 부분</div>
          <ul className="plain-list">
            {r.topMistakes.map((m, i) => <li key={i}>· {m}</li>)}
          </ul>
        </>
      )}
    </Card>
  );

  return (
    <div className="page">
      <Header title="📊 학습 리포트" />
      <Card>
        <div className="stat-row">
          <div className="stat"><div className="stat-num">{profile.level}</div><div className="muted small">레벨</div></div>
          <div className="stat"><div className="stat-num">{profile.xp}</div><div className="muted small">총 XP</div></div>
          <div className="stat"><div className="stat-num">🔥 {profile.streak}</div><div className="muted small">연속</div></div>
        </div>
        <div className="muted small">다음 레벨까지</div>
        <ProgressBar value={profile.levelProgress} />
        <div className="stat-row">
          <div className="stat"><div className="stat-num">{profile.lessonsCompleted}</div><div className="muted small">누적 레슨</div></div>
          <div className="stat"><div className="stat-num">{profile.vocabLearned}</div><div className="muted small">누적 단어</div></div>
          <div className="stat"><div className="stat-num">{avgPron ?? '—'}</div><div className="muted small">발음 평균</div></div>
        </div>
      </Card>
      <Section title="오늘" r={day} />
      <Section title="최근 7일" r={week} />
      <Section title="최근 30일" r={month} />
      {profile.grammarMastered.length > 0 && (
        <Card>
          <b>익힌 문법 패턴</b>
          <ul className="plain-list">{profile.grammarMastered.slice(-8).map((g, i) => <li key={i}>✅ {g}</li>)}</ul>
        </Card>
      )}
    </div>
  );
}
