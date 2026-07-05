/*
 * pages/AudioPractice.tsx — 음성 연습 (발음 · 듣기 · 말하기 챌린지)
 * 동작:
 *   - pronunciation: 현재 레벨 단원의 예문을 TTS 로 들려주고, STT 로 따라 말하면
 *     단어 일치율 기반 점수(0~100)를 채점. 프로필 pronunciationScores 에 누적.
 *   - listening: 문장을 화면에 숨긴 채 TTS 재생 → 받아쓰기 입력 → 일치율 채점.
 *   - speaking-challenge: 주제 질문을 주고 STT(또는 텍스트)로 길게 답하기. 단어 수 기준 피드백.
 *   - STT 미지원 브라우저에서는 발음/챌린지 모드에서 텍스트 입력으로 자동 폴백.
 * 의존성: services/speech.ts, data/curriculum.ts, store/AppContext.tsx
 */
import React, { useMemo, useState } from 'react';
import { unitsForLevel } from '../data/curriculum';
import { listenOnce, pronunciationScore, speak, sttAvailable } from '../services/speech';
import { useApp } from '../store/AppContext';
import { Btn, Card, Header, ProgressBar } from '../components/ui';
import { XP_TABLE } from '../engine/progress';

export type AudioMode = 'pronunciation' | 'listening' | 'speaking-challenge';

const TITLES: Record<AudioMode, string> = {
  pronunciation: '🎤 발음 연습',
  listening: '👂 듣기 연습',
  'speaking-challenge': '🔥 말하기 챌린지'
};

/** 말하기 챌린지 주제 (레벨 무관, 튜터가 아닌 자기표현 훈련이므로 한국어 안내 병기) */
const CHALLENGES: Record<'en' | 'ja', { prompt: string; ko: string }[]> = {
  en: [
    { prompt: 'Tell me about your morning routine.', ko: '아침 일과를 말해 보세요.' },
    { prompt: 'What did you eat today? Describe it.', ko: '오늘 먹은 음식을 묘사해 보세요.' },
    { prompt: 'Describe your favorite place in your city.', ko: '동네에서 가장 좋아하는 장소를 설명해 보세요.' },
    { prompt: 'What are your plans for this weekend?', ko: '이번 주말 계획을 말해 보세요.' }
  ],
  ja: [
    { prompt: 'まいにち なにを しますか。', ko: '매일 무엇을 하는지 말해 보세요.' },
    { prompt: 'きょうの てんきは どうですか。', ko: '오늘 날씨가 어떤지 말해 보세요.' },
    { prompt: 'すきな たべものを おしえてください。', ko: '좋아하는 음식을 소개해 보세요.' },
    { prompt: 'しゅうまつは なにを しますか。', ko: '주말에 무엇을 하는지 말해 보세요.' }
  ]
};

export default function AudioPractice({ mode }: { mode: AudioMode }) {
  const { profile, setProfile, recordActivity, navigate, settings } = useApp();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [heard, setHeard] = useState('');
  const [typed, setTyped] = useState('');
  const [listening, setListening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [micError, setMicError] = useState(false);

  /** 연습 문장 풀: 현재 레벨 단원의 스크립트 튜터 발화 + 패턴 예문 */
  const sentences = useMemo(() => {
    if (!profile) return [] as string[];
    const units = unitsForLevel(profile.language, profile.level as never);
    const pool: string[] = [];
    for (const u of units) {
      for (const t of u.script) if (t.tutor.length <= 80) pool.push(t.tutor);
    }
    return pool.slice(0, 10);
  }, [profile]);

  const challenges = profile ? CHALLENGES[profile.language] : [];

  if (!profile) {
    return (
      <div className="page"><Header title="음성 연습" />
        <p className="muted">프로필이 없어요. 먼저 레벨 테스트를 진행해 주세요.</p>
        <Btn full onClick={() => navigate({ name: 'onboarding' })}>레벨 테스트 시작</Btn>
      </div>
    );
  }

  const total = mode === 'speaking-challenge' ? challenges.length : sentences.length;
  const doneAll = idx >= total;

  const resetItem = () => { setScore(null); setHeard(''); setTyped(''); setRevealed(false); setMicError(false); };
  const nextItem = () => { resetItem(); setIdx((i) => i + 1); };

  async function gradeAgainst(target: string, said: string) {
    const s = pronunciationScore(target, said);
    setScore(s);
    setHeard(said);
    await recordActivity(XP_TABLE.pronunciationTry);
    if (mode === 'pronunciation') {
      const scores = [...profile!.pronunciationScores.slice(-19), s];
      await setProfile({ ...profile!, pronunciationScores: scores });
    }
    if (s < 60) await recordActivity(0, { mistake: `발음/듣기: "${target}"` });
  }

  async function mic(target: string) {
    if (!profile) return;
    setListening(true);
    setMicError(false);
    try {
      const said = await listenOnce(profile.language);
      await gradeAgainst(target, said);
    } catch {
      setMicError(true);
    } finally {
      setListening(false);
    }
  }

  if (doneAll) {
    const avg = profile.pronunciationScores.length
      ? Math.round(profile.pronunciationScores.reduce((a, b) => a + b, 0) / profile.pronunciationScores.length)
      : null;
    return (
      <div className="page"><Header title={TITLES[mode]} />
        <div className="hero"><div className="hero-icon">🎉</div><h2>연습 완료!</h2>
          {mode === 'pronunciation' && avg !== null && <p className="muted">최근 평균 발음 점수: <b>{avg}점</b></p>}
          <p className="muted">꾸준함이 최고의 선생님이에요.</p></div>
        <Btn full onClick={() => navigate({ name: 'home' })}>홈으로</Btn>
        <Btn full kind="ghost" onClick={() => { resetItem(); setIdx(0); }}>한 번 더</Btn>
      </div>
    );
  }

  // ---------- 말하기 챌린지 ----------
  if (mode === 'speaking-challenge') {
    const ch = challenges[idx];
    const wordCount = heard ? heard.trim().split(/\s+/).length : 0;
    return (
      <div className="page"><Header title={TITLES[mode]} />
        <ProgressBar value={(idx / total) * 100} />
        <Card>
          <p className="quiz-prompt">{ch.prompt}</p>
          <p className="muted small">{ch.ko} — 문장 2개 이상, 길게 말할수록 좋아요!</p>
          <button className="tts-btn" onClick={() => speak(ch.prompt, profile.language, settings.ttsRate)} aria-label="질문 듣기">🔊</button>
        </Card>
        {sttAvailable() && !micError ? (
          <Btn full onClick={() => void (async () => {
            setListening(true); setMicError(false);
            try { const said = await listenOnce(profile.language); setHeard(said); await recordActivity(XP_TABLE.pronunciationTry); }
            catch { setMicError(true); }
            finally { setListening(false); }
          })()} disabled={listening}>{listening ? '듣고 있어요… 🎙️' : '🎤 말하기 시작'}</Btn>
        ) : (
          <div className="chat-input-row">
            <input className="chat-input" value={typed} placeholder="여기에 답을 적어 보세요…" onChange={(e) => setTyped(e.target.value)} />
            <Btn onClick={() => { setHeard(typed); void recordActivity(XP_TABLE.pronunciationTry); }}>제출</Btn>
          </div>
        )}
        {micError && <p className="muted small center">🎤 음성 인식이 어려운 환경이에요. 위에 텍스트로 답해 주세요. (Chrome 권장)</p>}
        {heard && (
          <Card>
            <div className="muted small">내가 말한 내용</div>
            <p>{heard}</p>
            <div className="explain">{wordCount >= 8 ? `👏 ${wordCount}단어! 훌륭한 분량이에요.` : `${wordCount}단어 — 한 문장만 더 붙여 볼까요?`}</div>
            <Btn full onClick={nextItem}>다음 주제</Btn>
          </Card>
        )}
      </div>
    );
  }

  // ---------- 발음 / 듣기 ----------
  const target = sentences[idx] ?? '';
  if (!target) {
    return (
      <div className="page"><Header title={TITLES[mode]} />
        <p className="muted">이 레벨의 연습 문장이 아직 없어요.</p>
        <Btn full onClick={() => navigate({ name: 'home' })}>홈으로</Btn>
      </div>
    );
  }

  return (
    <div className="page"><Header title={TITLES[mode]} />
      <ProgressBar value={(idx / total) * 100} />
      <p className="muted small center">{idx + 1} / {total}</p>
      <Card>
        {mode === 'pronunciation' ? (
          <>
            <p className="quiz-prompt">{target}</p>
            <p className="muted small">🔊 로 들어 본 뒤, 🎤 를 누르고 따라 말해 보세요.</p>
          </>
        ) : (
          <>
            <p className="quiz-prompt">{revealed ? target : '🔊 를 눌러 문장을 듣고, 들리는 대로 입력해 보세요.'}</p>
          </>
        )}
        <button className="tts-btn" onClick={() => speak(target, profile.language, settings.ttsRate)} aria-label="문장 듣기">🔊</button>
      </Card>

      {mode === 'pronunciation' && (
        sttAvailable() && !micError ? (
          <Btn full onClick={() => void mic(target)} disabled={listening}>{listening ? '듣고 있어요… 🎙️' : '🎤 따라 말하기'}</Btn>
        ) : (
          <div className="chat-input-row">
            <input className="chat-input" value={typed} placeholder="말한 문장을 입력(음성 인식 불가 환경)" onChange={(e) => setTyped(e.target.value)} />
            <Btn onClick={() => void gradeAgainst(target, typed)}>채점</Btn>
          </div>
        )
      )}
      {mode === 'pronunciation' && micError && <p className="muted small center">🎤 음성 인식이 어려운 환경이에요. 텍스트 입력으로 채점할게요. (Chrome 권장)</p>}

      {mode === 'listening' && (
        <div className="chat-input-row">
          <input className="chat-input" value={typed} placeholder="들리는 대로 입력…" onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && typed.trim()) { setRevealed(true); void gradeAgainst(target, typed); } }} />
          <Btn onClick={() => { if (typed.trim()) { setRevealed(true); void gradeAgainst(target, typed); } }}>채점</Btn>
        </div>
      )}

      {score !== null && (
        <Card>
          <div className="score-big">{score}점</div>
          {heard && <div className="muted small">인식된 문장: {heard}</div>}
          <div className="explain">{score >= 80 ? '🌟 거의 완벽해요!' : score >= 60 ? '👍 좋아요, 한 번 더 하면 더 좋아질 거예요.' : '💪 천천히 또박또박 다시 해 볼까요?'}</div>
          <div className="grade-row">
            <Btn kind="ghost" onClick={resetItem}>다시 하기</Btn>
            <Btn onClick={nextItem}>다음 문장</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
