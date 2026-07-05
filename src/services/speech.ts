/*
 * services/speech.ts — 음성 서비스 (Web Speech API)
 * 목적: TTS(발화 듣기)·STT(말하기 인식) 제공.
 * API 선정 근거(api-registry 스킬 절차 적용):
 *   - 1순위: 브라우저 내장 Web Speech API — 키 불필요(no-key), 무료, Chrome/Android 에서
 *     Google 음성 엔진으로 구동됨. "무료 Google 호환" 요구사항을 합법적으로 충족.
 *   - Google Cloud Speech-to-Text / Text-to-Speech 는 무료 티어가 있어도 카드 등록이
 *     필요하므로(2026-07 기준, 변경 가능) 기본 경로에서 제외. 필요 시 다음 세션에서
 *     services/ai.ts 와 같은 어댑터 패턴으로 추가한다.
 *   - 폴백: SpeechRecognition 미지원 브라우저(예: 일부 iOS 버전)에서는 텍스트 입력으로
 *     자동 전환된다(sttAvailable() 로 감지).
 * 의존성: 없음 (브라우저 API 만 사용)
 */

/** SpeechRecognition 지원 여부 (Chrome/Edge/Android: 지원, 일부 브라우저 미지원) */
export function sttAvailable(): boolean {
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function ttsAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/** 학습 언어 → BCP-47 로케일 */
function locale(language: 'en' | 'ja'): string {
  return language === 'en' ? 'en-US' : 'ja-JP';
}

/** 텍스트 읽어주기. rate 0.5~1.2 (초보자용 느린 발화 기본 0.85). */
export function speak(text: string, language: 'en' | 'ja', rate = 0.85): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel(); // 이전 발화 중단
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale(language);
  u.rate = rate;
  // 해당 언어 보이스가 있으면 우선 사용
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang.startsWith(locale(language)));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsAvailable()) window.speechSynthesis.cancel();
}

/**
 * 한 번 듣기(STT). 결과 텍스트를 resolve. 미지원/오류 시 reject(호출측에서 텍스트 입력 폴백).
 */
export function listenOnce(language: 'en' | 'ja'): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      reject(new Error('STT_UNSUPPORTED'));
      return;
    }
    const rec = new Ctor();
    rec.lang = locale(language);
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let settled = false;
    rec.onresult = (e) => {
      settled = true;
      const t = e.results?.[0]?.[0]?.transcript ?? '';
      resolve(t);
    };
    rec.onerror = (e) => {
      if (!settled) reject(new Error(e.error || 'STT_ERROR'));
    };
    rec.onend = () => {
      if (!settled) reject(new Error('STT_NO_RESULT'));
    };
    rec.start();
  });
}

/** 발음 유사도 점수(0~100) — 단어 단위 일치율 기반 간이 채점 */
export function pronunciationScore(target: string, heard: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ぁ-んァ-ン一-龯ー\s]/g, '').split(/\s+/).filter(Boolean);
  const t = norm(target);
  const h = norm(heard);
  if (t.length === 0) return 0;
  let hit = 0;
  for (const w of t) if (h.includes(w)) hit += 1;
  return Math.round((hit / t.length) * 100);
}

/* 최소한의 SpeechRecognition 타입 (lib.dom 에 없는 브라우저 API 대비) */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
