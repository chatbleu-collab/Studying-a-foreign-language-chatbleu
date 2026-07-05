/*
 * services/ai.ts — AI 제공자 레이어 (api-registry 스킬의 선택·폴백 패턴 구현)
 * 목적: 대화 튜터의 LLM 호출을 추상화. 제공자 우선순위 체인:
 *   1) Gemini Flash (무료 티어 — 사용자가 직접 발급한 키 필요. 2026-07-04 검증:
 *      Flash 계열만 무료, 프로젝트 단위 한도, 결제 활성화 시 무료 티어 소멸)
 *   2) OfflineTutor (키 없음/호출 실패 시 자동 폴백 — engine/adaptive.ts)
 * 보안: 키는 settings.ts 에서 읽으며 Google API 호출에만 사용. 하드코딩 금지.
 * 확장(다음 세션): 새 제공자는 TutorProvider 인터페이스 구현 후 chooseProvider 에 추가.
 * 의존성: types/models.ts, engine/adaptive.ts, services/settings.ts
 */
import { AiProviderStatus, ChatMessage } from '../types/models';
import { parseTutorJson } from '../engine/adaptive';
import { loadSettings } from './settings';

export interface TutorReply {
  reply: string;
  replyKo?: string;
  correction?: { original: string; corrected: string; explainKo: string } | null;
  newWords?: { word: string; meaning: string }[];
}

/** 현재 사용 가능한 제공자 판정 (UI 상태 표시용) */
export function providerStatus(): AiProviderStatus {
  const s = loadSettings();
  if (s.geminiApiKey.trim()) {
    return { provider: 'gemini', reason: 'Gemini API 키가 설정되어 실시간 AI 튜터로 동작합니다.' };
  }
  return { provider: 'offline', reason: 'API 키가 없어 오프라인 스크립트 튜터로 동작합니다. 설정에서 무료 Gemini 키를 등록하면 자유 대화가 가능해집니다.' };
}

/**
 * Gemini generateContent 호출.
 * 실패(키 오류·한도 초과·네트워크) 시 예외를 던지며, 호출측(페이지)에서 오프라인 폴백한다.
 */
export async function askGemini(
  systemPrompt: string,
  history: ChatMessage[],
  userText: string
): Promise<TutorReply> {
  const s = loadSettings();
  const key = s.geminiApiKey.trim();
  if (!key) throw new Error('NO_KEY');

  const contents = [
    ...history
      .filter((m) => m.role !== 'system')
      .slice(-12) // 최근 12턴만 전송해 무료 한도 절약
      .map((m) => ({ role: m.role === 'tutor' ? 'model' : 'user', parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: userText }] }
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(s.geminiModel)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GEMINI_${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text) throw new Error('GEMINI_EMPTY');
  return parseTutorJson(text);
}
