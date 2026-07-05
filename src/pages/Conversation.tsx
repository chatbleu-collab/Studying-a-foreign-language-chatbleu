/*
 * pages/Conversation.tsx — 대화 화면 (자유회화·가이드레슨·롤플레이·여행 시뮬레이션)
 * 동작:
 *   - AI 제공자(services/ai.ts)의 우선순위에 따라 Gemini 또는 OfflineTutor 로 진행.
 *   - Gemini 호출 실패 시 그 자리에서 오프라인 튜터로 자동 폴백(사용자에게 고지).
 *   - 튜터 발화는 🔊 버튼으로 TTS 재생, 학습자 입력은 텍스트 또는 🎤 STT.
 *   - 교정(correction)과 신규 단어(newWords)를 말풍선 하단에 표시하고 SRS 덱에 자동 추가.
 *   - 가이드 레슨 완료 시 levelProgress 반영·승급 판단·단원 인덱스 전진.
 * 의존성: engine/adaptive.ts, services/ai.ts, services/speech.ts, engine/level.ts,
 *         engine/srs.ts, services/db.ts, store/AppContext.tsx
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, CurriculumUnit, LessonMode, VocabItem } from '../types/models';
import { unitsFor } from '../data/curriculum';
import { OfflineTutor, SCENARIOS, buildTutorSystemPrompt, quickCorrect } from '../engine/adaptive';
import { askGemini, providerStatus } from '../services/ai';
import { listenOnce, speak, sttAvailable } from '../services/speech';
import { applyResult, nextLevel } from '../engine/level';
import { newCard } from '../engine/srs';
import { dbPutCard } from '../services/db';
import { useApp } from '../store/AppContext';
import { Badge, Header } from '../components/ui';
import { XP_TABLE } from '../engine/progress';

export default function Conversation({ mode, scenarioKey }: { mode: LessonMode; scenarioKey?: string }) {
  const { profile, setProfile, recordActivity, settings, navigate } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [helpKo, setHelpKo] = useState('');
  const [usingOffline, setUsingOffline] = useState(providerStatus().provider === 'offline');
  const [done, setDone] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const offlineTutorRef = useRef<OfflineTutor | null>(null);

  // 현재 단원: 가이드 레슨은 currentUnitIndex, 그 외에는 현재 레벨의 첫 단원(오프라인 폴백용)
  const unit: CurriculumUnit | undefined = useMemo(() => {
    if (!profile) return undefined;
    const list = unitsFor(profile.language);
    if (mode === 'guided-lesson') {
      return list[Math.min(profile.currentUnitIndex, list.length - 1)];
    }
    const levelUnits = list.filter((u) => u.level === profile.level);
    return levelUnits[0] ?? list[0];
  }, [profile, mode]);

  const title = mode === 'guided-lesson' ? `📘 ${unit?.title ?? '가이드 레슨'}`
    : mode === 'role-play' ? `🎭 ${scenarioKey ? SCENARIOS[scenarioKey]?.titleKo : '롤플레이'}`
    : mode === 'travel' ? `✈️ ${scenarioKey ? SCENARIOS[scenarioKey]?.titleKo : '여행 시뮬레이션'}`
    : '💬 자유 회화';

  // 첫 튜터 발화
  useEffect(() => {
    if (!profile || !unit) return;
    const tutor = new OfflineTutor(unit);
    offlineTutorRef.current = tutor;
    const status = providerStatus();
    if (status.provider === 'gemini') {
      // Gemini 모드: 첫 인사도 LLM 이 생성
      setBusy(true);
      const sys = buildTutorSystemPrompt(profile, mode, unit, scenarioKey);
      askGemini(sys, [], '(학습자가 방금 입장했습니다. 수준에 맞는 첫 인사와 첫 질문을 해 주세요.)')
        .then((r) => {
          const msg: ChatMessage = { role: 'tutor', text: r.reply, ts: Date.now(), newWords: toVocab(r.newWords) };
          setMessages([msg]);
          setHelpKo(r.replyKo ?? '');
          speak(r.reply, profile.language, settings.ttsRate);
        })
        .catch(() => {
          setUsingOffline(true);
          const opening = tutor.opening();
          setMessages([opening]);
          setHelpKo(tutor.openingKo());
          speak(opening.text, profile.language, settings.ttsRate);
        })
        .finally(() => setBusy(false));
    } else {
      const opening = tutor.opening();
      setMessages([opening]);
      setHelpKo(tutor.openingKo());
      speak(opening.text, profile.language, settings.ttsRate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  function toVocab(words?: { word: string; meaning: string }[]): VocabItem[] {
    return (words ?? []).map((w) => ({ word: w.word, meaning: w.meaning }));
  }

  /** 신규 단어를 SRS 덱에 자동 추가 */
  async function saveNewWords(items: VocabItem[]) {
    if (!profile || items.length === 0) return;
    for (const it of items) await dbPutCard(newCard(profile.language, it));
    await recordActivity(0, { newWords: items.length });
  }

  async function send(textRaw?: string) {
    const text = (textRaw ?? input).trim();
    if (!text || busy || !profile || !unit) return;
    setInput('');
    setHelpKo('');
    const learnerMsg: ChatMessage = { role: 'learner', text, ts: Date.now() };
    setMessages((m) => [...m, learnerMsg]);
    setBusy(true);
    setTurnCount((c) => c + 1);
    await recordActivity(XP_TABLE.conversationTurn);

    const localCorrection = quickCorrect(profile.language, text);

    if (!usingOffline) {
      try {
        const sys = buildTutorSystemPrompt(profile, mode, unit, scenarioKey);
        const r = await askGemini(sys, [...messages, learnerMsg], text);
        const newWords = toVocab(r.newWords);
        const msg: ChatMessage = {
          role: 'tutor', text: r.reply, ts: Date.now(),
          correction: r.correction ?? localCorrection ?? undefined,
          newWords
        };
        setMessages((m) => [...m, msg]);
        setHelpKo(r.replyKo ?? '');
        speak(r.reply, profile.language, settings.ttsRate);
        if (msg.correction) await recordActivity(0, { mistake: msg.correction.explainKo });
        await saveNewWords(newWords);
        setBusy(false);
        return;
      } catch {
        setUsingOffline(true); // 자동 폴백 (아래 오프라인 경로로 계속)
      }
    }

    // 오프라인 스크립트 튜터
    const tutor = offlineTutorRef.current!;
    const r = tutor.respond(text);
    const msg: ChatMessage = { ...r.message, correction: localCorrection ?? undefined };
    setMessages((m) => [...m, msg]);
    setHelpKo(r.helpKo);
    speak(msg.text, profile.language, settings.ttsRate);
    if (r.matched) setMatchedCount((c) => c + 1);
    if (localCorrection) await recordActivity(0, { mistake: localCorrection.explainKo });

    if (r.done && !done) {
      setDone(true);
      await finishLesson(r.matched ? matchedCount + 1 : matchedCount);
    }
    setBusy(false);
  }

  /** 가이드 레슨 완료 처리: XP·진도·승급·단원 전진·단원 어휘 SRS 등록 */
  async function finishLesson(finalMatched: number) {
    if (!profile || !unit) return;
    await recordActivity(XP_TABLE.lessonComplete, { lessons: 1 });
    await saveNewWords(unit.vocab);
    if (mode === 'guided-lesson') {
      const steps = unit.script.filter((s) => s.expect && s.expect.length > 0).length || 1;
      const accuracy = Math.min(1, finalMatched / steps);
      const { progress, promoted } = applyResult(profile.levelProgress, accuracy);
      const list = unitsFor(profile.language);
      const nextIndex = Math.min(profile.currentUnitIndex + 1, list.length - 1);
      const updated = {
        ...profile,
        levelProgress: progress,
        level: promoted ? nextLevel(profile.language, profile.level) : profile.level,
        currentUnitIndex: nextIndex,
        grammarMastered: unit.patterns.length
          ? Array.from(new Set([...profile.grammarMastered, unit.patterns[0]]))
          : profile.grammarMastered
      };
      await setProfile(updated);
      if (promoted) setHelpKo(`🎉 축하합니다! ${updated.level} 레벨로 승급했어요!`);
    }
  }

  async function mic() {
    if (!profile) return;
    try {
      const heard = await listenOnce(profile.language);
      if (heard) void send(heard);
    } catch {
      setHelpKo('🎤 음성 인식을 사용할 수 없어요. 텍스트로 입력해 주세요. (Chrome 브라우저 권장)');
    }
  }

  if (!profile || !unit) {
    return (
      <div className="page"><Header title="대화" />
        <p className="muted">프로필이 없어요. 먼저 레벨 테스트를 진행해 주세요.</p>
        <button className="btn btn-primary btn-full" onClick={() => navigate({ name: 'onboarding' })}>레벨 테스트 시작</button>
      </div>
    );
  }

  return (
    <div className="page chat-page">
      <Header title={title} />
      <div className="chat-meta">
        <Badge tone={usingOffline ? 'gray' : 'green'}>{usingOffline ? '오프라인 스크립트 튜터' : 'Gemini AI 튜터'}</Badge>
        <Badge tone="blue">{profile.level}</Badge>
        <span className="muted tiny">대화 {turnCount}턴</span>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble-row ${m.role}`}>
            <div className={`bubble ${m.role}`}>
              <div className="bubble-text">{m.text}</div>
              {m.role === 'tutor' && (
                <button className="tts-btn" onClick={() => speak(m.text, profile.language, settings.ttsRate)} aria-label="발음 듣기">🔊</button>
              )}
              {m.correction && (
                <div className="correction">
                  ✏️ <s>{m.correction.original}</s> → <b>{m.correction.corrected}</b>
                  <div className="muted tiny">{m.correction.explainKo}</div>
                </div>
              )}
              {m.newWords && m.newWords.length > 0 && (
                <div className="newwords">
                  {m.newWords.map((w, j) => (
                    <span key={j} className="badge badge-amber">📖 {w.word}{w.reading ? ` (${w.reading})` : ''} — {w.meaning}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="bubble-row tutor"><div className="bubble tutor typing">···</div></div>}
      </div>

      {helpKo && <div className="help-ko">{helpKo}</div>}

      {done ? (
        <div className="chat-input-row">
          <button className="btn btn-primary btn-full" onClick={() => navigate({ name: 'home' })}>레슨 완료! 홈으로 🎉</button>
        </div>
      ) : (
        <div className="chat-input-row">
          {sttAvailable() && (
            <button className="icon-btn mic" onClick={() => void mic()} disabled={busy} aria-label="말하기">🎤</button>
          )}
          <input
            className="chat-input"
            value={input}
            placeholder={profile.language === 'en' ? '영어로 답해 보세요…' : 'にほんご/로마자로 답해 보세요…'}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
            disabled={busy}
          />
          <button className="btn btn-primary" onClick={() => void send()} disabled={busy || !input.trim()}>보내기</button>
        </div>
      )}
    </div>
  );
}
