/*
 * pages/Quiz.tsx — 퀴즈 화면 (단어 SRS · 문법 · JLPT · TOEIC 통합)
 * 동작:
 *   - kind='vocab': SRS 덱에서 오늘 복습 카드 로드. 부족하면 현재 레벨 단원 어휘에서 새 카드 보충.
 *     카드 앞면(단어) → 뒤집기 → 자기 평가(다시/어려움/보통/쉬움) → engine/srs.review 로 간격 갱신.
 *   - kind='grammar'|'jlpt'|'toeic': data/quizzes.ts 문제은행에서 4지선다 진행, 즉시 해설 표시.
 * 의존성: engine/srs.ts, services/db.ts, data/quizzes.ts, data/curriculum.ts, store/AppContext.tsx
 */
import React, { useEffect, useMemo, useState } from 'react';
import { QuizQuestion, SrsCard } from '../types/models';
import { questionsBy } from '../data/quizzes';
import { unitsForLevel } from '../data/curriculum';
import { dueCards, newCard, review } from '../engine/srs';
import { dbAllCards, dbPutCard } from '../services/db';
import { useApp } from '../store/AppContext';
import { Btn, Card, Header, ProgressBar } from '../components/ui';
import { XP_TABLE } from '../engine/progress';
import { speak } from '../services/speech';

export type QuizKind = 'grammar' | 'jlpt' | 'toeic' | 'vocab';

const TITLES: Record<QuizKind, string> = {
  vocab: '🃏 단어 학습 (SRS)',
  grammar: '✏️ 문법 트레이너',
  jlpt: '🇯🇵 JLPT 연습',
  toeic: '📝 TOEIC 연습'
};

const MAX_SESSION_CARDS = 10;

export default function Quiz({ kind }: { kind: QuizKind }) {
  const { profile, recordActivity, navigate, settings } = useApp();

  // ---------- 단어 SRS 모드 상태 ----------
  const [cards, setCards] = useState<SrsCard[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [srsLoaded, setSrsLoaded] = useState(false);

  // ---------- 객관식 모드 상태 ----------
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions: QuizQuestion[] = useMemo(() => {
    if (!profile || kind === 'vocab') return [];
    return questionsBy(kind, profile.language);
  }, [profile, kind]);

  // SRS 카드 로드 (vocab 전용)
  useEffect(() => {
    if (!profile || kind !== 'vocab') return;
    (async () => {
      const all = (await dbAllCards()).filter((c) => c.language === profile.language);
      let session = dueCards(all).slice(0, MAX_SESSION_CARDS);
      if (session.length < MAX_SESSION_CARDS) {
        // 새 카드 보충: 현재 레벨 단원 어휘 중 덱에 없는 단어
        const known = new Set(all.map((c) => c.item.word));
        const fresh: SrsCard[] = [];
        for (const u of unitsForLevel(profile.language, profile.level as never)) {
          for (const v of u.vocab) {
            if (!known.has(v.word) && fresh.length + session.length < MAX_SESSION_CARDS) {
              fresh.push(newCard(profile.language, v));
            }
          }
        }
        for (const c of fresh) await dbPutCard(c);
        if (fresh.length > 0) await recordActivity(0, { newWords: fresh.length });
        session = [...session, ...fresh];
      }
      setCards(session);
      setSrsLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, kind]);

  if (!profile) {
    return (
      <div className="page"><Header title="퀴즈" />
        <p className="muted">프로필이 없어요. 먼저 레벨 테스트를 진행해 주세요.</p>
        <Btn full onClick={() => navigate({ name: 'onboarding' })}>레벨 테스트 시작</Btn>
      </div>
    );
  }

  // ================= 단어 SRS =================
  if (kind === 'vocab') {
    if (!srsLoaded) return <div className="page"><Header title={TITLES.vocab} /><p className="muted center">카드를 불러오는 중…</p></div>;
    if (cards.length === 0 || cardIdx >= cards.length) {
      return (
        <div className="page"><Header title={TITLES.vocab} />
          <div className="hero"><div className="hero-icon">🎉</div><h2>오늘 복습 끝!</h2>
            <p className="muted">{cards.length > 0 ? `${cards.length}장의 카드를 복습했어요.` : '복습할 카드가 아직 없어요. 레슨에서 새 단어를 배우면 여기에 쌓여요.'}</p></div>
          <Btn full onClick={() => navigate({ name: 'home' })}>홈으로</Btn>
        </div>
      );
    }
    const card = cards[cardIdx];
    const grade = async (g: 0 | 1 | 2 | 3) => {
      await dbPutCard(review(card, g));
      if (g >= 2) await recordActivity(XP_TABLE.vocabReview);
      setFlipped(false);
      setCardIdx((i) => i + 1);
    };
    return (
      <div className="page"><Header title={TITLES.vocab} />
        <ProgressBar value={(cardIdx / cards.length) * 100} />
        <p className="muted small center">{cardIdx + 1} / {cards.length}</p>
        <Card className="flash" onClick={() => setFlipped(true)}>
          <div className="flash-word">{card.item.word}</div>
          {card.item.reading && flipped && <div className="muted">{card.item.reading}</div>}
          {flipped
            ? <div className="flash-meaning">{card.item.meaning}{card.item.example && <div className="muted small">예: {card.item.example}</div>}</div>
            : <div className="muted small">탭해서 뜻 보기</div>}
          <button className="tts-btn" onClick={(e) => { e.stopPropagation(); speak(card.item.word, profile.language, settings.ttsRate); }} aria-label="발음 듣기">🔊</button>
        </Card>
        {flipped && (
          <div className="grade-row">
            <button className="btn btn-danger" onClick={() => void grade(0)}>다시</button>
            <button className="btn btn-ghost" onClick={() => void grade(1)}>어려움</button>
            <button className="btn btn-ghost" onClick={() => void grade(2)}>보통</button>
            <button className="btn btn-primary" onClick={() => void grade(3)}>쉬움</button>
          </div>
        )}
      </div>
    );
  }

  // ================= 객관식 (문법/JLPT/TOEIC) =================
  if (questions.length === 0) {
    return (
      <div className="page"><Header title={TITLES[kind]} />
        <p className="muted">이 언어에서는 해당 문제 유형이 제공되지 않아요.</p>
        <Btn full onClick={() => navigate({ name: 'home' })}>홈으로</Btn>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="page"><Header title={TITLES[kind]} />
        <div className="hero"><div className="hero-icon">{pct >= 70 ? '🏆' : '💪'}</div>
          <h2>{correctCount} / {questions.length} 정답 ({pct}%)</h2>
          <p className="muted">{pct >= 70 ? '훌륭해요! 다음 단계로 갈 준비가 됐어요.' : '틀린 유형은 약점으로 기록했어요. 다시 도전해 보세요.'}</p></div>
        <Btn full onClick={() => navigate({ name: 'home' })}>홈으로</Btn>
        <Btn full kind="ghost" onClick={() => { setQIdx(0); setPicked(null); setCorrectCount(0); setFinished(false); }}>다시 풀기</Btn>
      </div>
    );
  }

  const q = questions[qIdx];
  const pick = async (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    if (ok) {
      setCorrectCount((c) => c + 1);
      await recordActivity(XP_TABLE.quizCorrect);
    } else {
      await recordActivity(0, { mistake: q.explain });
    }
  };
  const next = () => {
    setPicked(null);
    if (qIdx + 1 < questions.length) setQIdx(qIdx + 1);
    else setFinished(true);
  };

  return (
    <div className="page"><Header title={TITLES[kind]} />
      <ProgressBar value={(qIdx / questions.length) * 100} />
      <p className="muted small center">{qIdx + 1} / {questions.length}</p>
      <Card>
        <p className="quiz-prompt">{q.prompt}</p>
        {q.choices.map((c, i) => {
          let cls = 'choice';
          if (picked !== null) {
            if (i === q.answer) cls += ' correct';
            else if (i === picked) cls += ' wrong';
          }
          return <button key={i} className={cls} onClick={() => void pick(i)} disabled={picked !== null}>{c}</button>;
        })}
        {picked !== null && (
          <div className="explain">
            {picked === q.answer ? '⭕ 정답!' : '❌ 오답'} — {q.explain}
          </div>
        )}
      </Card>
      {picked !== null && <Btn full onClick={next}>{qIdx + 1 < questions.length ? '다음 문제' : '결과 보기'}</Btn>}
    </div>
  );
}
