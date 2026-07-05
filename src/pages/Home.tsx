/*
 * pages/Home.tsx — 홈 대시보드
 * 구성: 프로필 스탯(레벨/XP/스트릭) → 일일 미션 → 레슨 모드 그리드(12종) → AI 상태 표시.
 * 일일 미션 규칙: 오늘 로그 기준 (레슨 1개 / 새 단어 3개 / XP 50) 3개 달성 시 보너스 XP 1회 지급.
 * 의존성: store/AppContext.tsx, services/db.ts, services/ai.ts, engine/progress.ts
 */
import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { Badge, Card, ProgressBar } from '../components/ui';
import { dbGetLog } from '../services/db';
import { todayStr } from '../engine/srs';
import { DailyLog, LessonMode } from '../types/models';
import { providerStatus } from '../services/ai';
import { XP_TABLE } from '../engine/progress';
import { SCENARIOS } from '../engine/adaptive';

interface ModeDef { mode: LessonMode; icon: string; label: string; desc: string }

const MODES: ModeDef[] = [
  { mode: 'free-conversation', icon: '💬', label: '자유 회화', desc: 'AI와 자유 대화' },
  { mode: 'guided-lesson', icon: '📘', label: '가이드 레슨', desc: '커리큘럼 순서 학습' },
  { mode: 'role-play', icon: '🎭', label: '롤플레이', desc: '상황극 연습' },
  { mode: 'pronunciation', icon: '🎤', label: '발음 연습', desc: '따라 말하고 채점' },
  { mode: 'vocabulary', icon: '🃏', label: '단어 학습', desc: '간격 반복(SRS)' },
  { mode: 'grammar', icon: '✏️', label: '문법 트레이너', desc: '핵심 문법 퀴즈' },
  { mode: 'listening', icon: '👂', label: '듣기 연습', desc: '듣고 받아쓰기' },
  { mode: 'speaking-challenge', icon: '🔥', label: '말하기 챌린지', desc: '길게 말하기 도전' },
  { mode: 'jlpt', icon: '🇯🇵', label: 'JLPT 연습', desc: '일본어 시험 대비' },
  { mode: 'toeic', icon: '📝', label: 'TOEIC 연습', desc: '영어 시험 대비' },
  { mode: 'travel', icon: '✈️', label: '여행 시뮬레이션', desc: '여행 상황 연습' },
  { mode: 'daily-mission', icon: '🎯', label: '일일 미션', desc: '오늘의 목표 달성' }
];

export default function Home() {
  const { profile, navigate, recordActivity } = useApp();
  const [log, setLog] = useState<DailyLog | undefined>();
  const [scenarioPick, setScenarioPick] = useState<null | 'role-play' | 'travel'>(null);
  const ai = providerStatus();

  useEffect(() => {
    if (profile) void dbGetLog(profile.language, todayStr()).then(setLog);
  }, [profile]);

  if (!profile) {
    return (
      <div className="page">
        <div className="hero"><div className="hero-icon">👋</div><h1>환영합니다</h1>
          <p className="muted">먼저 레벨 테스트로 시작해 주세요.</p></div>
        <button className="btn btn-primary btn-full" onClick={() => navigate({ name: 'onboarding' })}>시작하기</button>
      </div>
    );
  }

  const missions = [
    { label: '레슨 1개 완료', done: (log?.lessons ?? 0) >= 1 },
    { label: '새 단어 3개 학습', done: (log?.newWords ?? 0) >= 3 },
    { label: 'XP 50 획득', done: (log?.xp ?? 0) >= 50 }
  ];
  const allDone = missions.every((m) => m.done);
  const bonusKey = `alc-mission-bonus-${profile.language}-${todayStr()}`;
  const bonusClaimed = localStorage.getItem(bonusKey) === '1';

  const claimBonus = () => {
    localStorage.setItem(bonusKey, '1');
    void recordActivity(XP_TABLE.dailyMission);
  };

  const openMode = (mode: LessonMode) => {
    if (mode === 'vocabulary') return navigate({ name: 'quiz', kind: 'vocab' });
    if (mode === 'grammar') return navigate({ name: 'quiz', kind: 'grammar' });
    if (mode === 'jlpt') return navigate({ name: 'quiz', kind: 'jlpt' });
    if (mode === 'toeic') return navigate({ name: 'quiz', kind: 'toeic' });
    if (mode === 'pronunciation' || mode === 'listening' || mode === 'speaking-challenge')
      return navigate({ name: 'audio', mode });
    if (mode === 'daily-mission') return; // 미션은 홈 카드에서 진행 상황 확인
    if (mode === 'role-play' || mode === 'travel') return setScenarioPick(mode);
    return navigate({ name: 'conversation', mode });
  };

  const langLabel = profile.language === 'en' ? '영어' : '일본어';

  return (
    <div className="page">
      <header className="header home-header">
        <h1>🗣️ AI Language Coach</h1>
        <Badge tone={ai.provider === 'gemini' ? 'green' : 'gray'}>{ai.provider === 'gemini' ? 'AI 연결됨' : '오프라인 모드'}</Badge>
      </header>

      <Card>
        <div className="stat-row">
          <div className="stat"><div className="stat-num">{profile.level}</div><div className="muted small">{langLabel} 레벨</div></div>
          <div className="stat"><div className="stat-num">{profile.xp}</div><div className="muted small">XP</div></div>
          <div className="stat"><div className="stat-num">🔥 {profile.streak}</div><div className="muted small">연속 학습</div></div>
        </div>
        <div className="muted small">다음 레벨까지</div>
        <ProgressBar value={profile.levelProgress} />
      </Card>

      <Card>
        <b>🎯 오늘의 미션</b>
        <ul className="plain-list">
          {missions.map((m, i) => (
            <li key={i} className={m.done ? 'done' : ''}>{m.done ? '✅' : '⬜'} {m.label}</li>
          ))}
        </ul>
        {allDone && !bonusClaimed && (
          <button className="btn btn-primary btn-full" onClick={claimBonus}>미션 완료! 보너스 +{XP_TABLE.dailyMission} XP 받기</button>
        )}
        {allDone && bonusClaimed && <div className="muted small">오늘 미션 보너스를 받았어요. 내일 또 만나요! 🎉</div>}
      </Card>

      <h2>레슨 모드</h2>
      <div className="mode-grid">
        {MODES.map((m) => {
          const disabled =
            (m.mode === 'jlpt' && profile.language !== 'ja') ||
            (m.mode === 'toeic' && profile.language !== 'en');
          return (
            <button key={m.mode} className="mode-tile" disabled={disabled} onClick={() => openMode(m.mode)}>
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
              <span className="muted tiny">{disabled ? `${m.mode === 'jlpt' ? '일본어' : '영어'} 전용` : m.desc}</span>
            </button>
          );
        })}
      </div>

      {scenarioPick && (
        <div className="sheet" onClick={() => setScenarioPick(null)}>
          <div className="sheet-body" onClick={(e) => e.stopPropagation()}>
            <b>{scenarioPick === 'travel' ? '✈️ 여행 상황 선택' : '🎭 롤플레이 상황 선택'}</b>
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <button key={key} className="choice" onClick={() => { setScenarioPick(null); navigate({ name: 'conversation', mode: scenarioPick, scenarioKey: key }); }}>
                {s.titleKo}
              </button>
            ))}
            <button className="btn btn-ghost btn-full" onClick={() => setScenarioPick(null)}>닫기</button>
          </div>
        </div>
      )}

      <p className="muted small center">{ai.reason}</p>
    </div>
  );
}
