/*
 * pages/Onboarding.tsx — 최초 실행 경험
 * 흐름: 언어 선택 → 배치 테스트 → 레벨 추정 → 학습 로드맵 표시 → 첫 레슨 시작.
 * 의존성: data/quizzes.ts, engine/level.ts, store/AppContext.tsx, engine/srs.ts(todayStr)
 */
import React, { useMemo, useState } from 'react';
import { Language, LearnerProfile, QuizQuestion } from '../types/models';
import { questionsBy } from '../data/quizzes';
import { levelsFor, scorePlacement } from '../engine/level';
import { unitsForLevel } from '../data/curriculum';
import { useApp } from '../store/AppContext';
import { Btn, Card, ProgressBar } from '../components/ui';
import { todayStr } from '../engine/srs';
import { XP_TABLE } from '../engine/progress';

type Step = 'language' | 'test' | 'result';

export default function Onboarding() {
  const { setProfile, navigate, recordActivity } = useApp();
  const [step, setStep] = useState<Step>('language');
  const [language, setLanguage] = useState<Language>('en');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultLevel, setResultLevel] = useState<string>('');

  const questions: QuizQuestion[] = useMemo(() => questionsBy('placement', language), [language]);

  const startTest = (lang: Language) => {
    setLanguage(lang);
    setQIndex(0);
    setAnswers([]);
    setStep('test');
  };

  const answer = async (choice: number) => {
    const next = [...answers, choice];
    setAnswers(next);
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      return;
    }
    // 채점 → 프로필 생성
    const level = scorePlacement(language, questions, next);
    setResultLevel(level);
    const profile: LearnerProfile = {
      language,
      level,
      levelProgress: 0,
      xp: 0,
      streak: 0,
      lastStudyDate: '',
      lessonsCompleted: 0,
      vocabLearned: 0,
      grammarMastered: [],
      weakAreas: [],
      pronunciationScores: [],
      placementDone: true,
      currentUnitIndex: 0,
      createdAt: todayStr()
    };
    await setProfile(profile);
    setStep('result');
  };

  if (step === 'language') {
    return (
      <div className="page">
        <div className="hero">
          <div className="hero-icon">🗣️</div>
          <h1>AI Language Coach</h1>
          <p className="muted">오빠의 수준에 맞춰 난이도를 자동 조절하는 AI 회화 선생님이에요.<br />먼저 배울 언어를 골라 주세요.</p>
        </div>
        <Card onClick={() => startTest('en')}>
          <div className="lang-row"><span className="lang-flag">🇺🇸</span><div><b>영어</b><div className="muted small">초급~중하급 · CEFR A0~B2 커리큘럼</div></div></div>
        </Card>
        <Card onClick={() => startTest('ja')}>
          <div className="lang-row"><span className="lang-flag">🇯🇵</span><div><b>일본어</b><div className="muted small">완전 초보 환영 · JLPT N5~N2 커리큘럼</div></div></div>
        </Card>
        <p className="muted small center">언어는 나중에 설정에서 다시 시작할 수 있어요.</p>
      </div>
    );
  }

  if (step === 'test') {
    const q = questions[qIndex];
    return (
      <div className="page">
        <h2>레벨 테스트</h2>
        <p className="muted small">{qIndex + 1} / {questions.length} — 모르는 문제는 편하게 찍어도 돼요. 정확한 시작 레벨을 찾기 위한 테스트입니다.</p>
        <ProgressBar value={(qIndex / questions.length) * 100} />
        <Card>
          <p className="quiz-prompt">{q.prompt}</p>
          {q.choices.map((c, i) => (
            <button key={i} className="choice" onClick={() => void answer(i)}>{c}</button>
          ))}
        </Card>
      </div>
    );
  }

  // result
  const units = unitsForLevel(language, resultLevel as never);
  const allLevels = levelsFor(language);
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-icon">🎯</div>
        <h1>시작 레벨: {resultLevel}</h1>
        <p className="muted">테스트 결과를 바탕으로 학습 로드맵을 만들었어요.</p>
      </div>
      <Card>
        <b>학습 로드맵</b>
        <div className="roadmap">
          {allLevels.map((lv) => (
            <span key={lv} className={`roadmap-step ${lv === resultLevel ? 'active' : ''}`}>{lv}</span>
          ))}
        </div>
        <div className="muted small">현재 레벨({resultLevel})의 첫 단원부터 시작합니다:</div>
        <ul className="plain-list">
          {units.slice(0, 4).map((u) => <li key={u.id}>· {u.title}</li>)}
        </ul>
      </Card>
      <Btn full onClick={() => {
        void recordActivity(XP_TABLE.placementDone);
        navigate({ name: 'conversation', mode: 'guided-lesson' });
      }}>첫 레슨 시작하기 🚀</Btn>
      <Btn full kind="ghost" onClick={() => navigate({ name: 'home' })}>홈으로 이동</Btn>
    </div>
  );
}
