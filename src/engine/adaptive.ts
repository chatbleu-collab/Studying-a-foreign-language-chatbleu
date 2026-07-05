/*
 * engine/adaptive.ts — 적응형 대화 엔진
 * 목적:
 *   (1) buildTutorSystemPrompt: 학습자 프로필 → AI(Gemini) 시스템 프롬프트 생성.
 *       난이도·교정 방식·신규 어휘 개수를 레벨에 맞춰 지시한다.
 *   (2) OfflineTutor: API 키가 없거나 네트워크 실패 시 커리큘럼 스크립트 기반으로
 *       동작하는 규칙 기반 튜터. (한계: 자유 주제 이해 불가 — 스크립트 진행형)
 *   (3) quickCorrect: 규칙 기반 간이 교정(대표적 초급 오류 패턴만 탐지).
 * 의존성: types/models.ts, engine/level.ts, data/curriculum.ts
 */
import { ChatMessage, Correction, CurriculumUnit, Language, LearnerProfile, LessonMode } from '../types/models';
import { difficultyGuide } from './level';

/** 롤플레이/여행 시뮬레이션 시나리오 정의 */
export const SCENARIOS: Record<string, { titleKo: string; en: string; ja: string }> = {
  cafe: { titleKo: '카페에서 주문하기', en: 'You are a friendly cafe staff member. The learner is a customer ordering drinks.', ja: 'カフェの店員として、注文を受けてください。' },
  hotel: { titleKo: '호텔 체크인', en: 'You are a hotel receptionist. The learner is checking in.', ja: 'ホテルのフロント係として、チェックインを手伝ってください。' },
  airport: { titleKo: '공항에서', en: 'You are airport staff. The learner asks about gates, luggage, and boarding.', ja: '空港スタッフとして、搭乗案内をしてください。' },
  taxi: { titleKo: '택시 타기', en: 'You are a taxi driver. The learner tells you where to go and makes small talk.', ja: 'タクシー運転手として、行き先を聞いて雑談してください。' },
  interview: { titleKo: '간단한 인터뷰', en: 'You are a kind interviewer asking about the learner\'s life and hobbies.', ja: 'やさしいインタビュアーとして、趣味や生活について質問してください。' }
};

/**
 * Gemini 등 LLM 에 전달할 시스템 프롬프트 생성.
 * 학습자 레벨·약점·최근 실수를 반영하며, 절대 학습자 수준 이상으로 말하지 않도록 지시한다.
 */
export function buildTutorSystemPrompt(
  profile: LearnerProfile,
  mode: LessonMode,
  unit?: CurriculumUnit,
  scenarioKey?: string
): string {
  const langName = profile.language === 'en' ? '영어(English)' : '일본어(日本語)';
  const guide = difficultyGuide(profile.language, profile.level);
  const weak = profile.weakAreas.length ? profile.weakAreas.slice(-5).join(', ') : '없음';

  let modeInstruction = '';
  switch (mode) {
    case 'guided-lesson':
      modeInstruction = unit
        ? `이번 레슨 주제는 "${unit.topic}" 입니다. 목표 어휘: ${unit.vocab.map((v) => v.word).join(', ')}. 목표 문형: ${unit.patterns.join(' / ')}. 이 범위 안에서만 대화를 이끌어 주세요.`
        : '커리큘럼 순서에 맞는 가이드 레슨을 진행하세요.';
      break;
    case 'role-play':
    case 'travel': {
      const s = scenarioKey ? SCENARIOS[scenarioKey] : undefined;
      modeInstruction = s
        ? `롤플레이 상황: ${profile.language === 'en' ? s.en : s.ja} 상황에서 벗어나지 말고 역할을 유지하세요.`
        : '학습자가 고른 상황극을 유지하세요.';
      break;
    }
    case 'speaking-challenge':
      modeInstruction = '학습자가 최대한 길게 말하도록 개방형 질문을 하고, 짧게 답하면 이어서 더 말하도록 유도하세요.';
      break;
    default:
      modeInstruction = '자유 대화입니다. 학습자가 흥미를 보이는 주제를 따라가되 난이도 규칙을 지키세요.';
  }

  return [
    `당신은 전문 ${langName} 회화 교사입니다. 학습자는 한국인입니다.`,
    `[학습자 수준] ${profile.level} — 절대 이 수준보다 크게 어렵게 말하지 마세요.`,
    `[난이도 규칙] ${guide}`,
    `[학습자 약점] ${weak} — 자연스럽게 이 부분을 연습시키세요.`,
    `[모드] ${modeInstruction}`,
    '',
    '[응답 규칙 — 반드시 준수]',
    '1. 학습자의 직전 발화에 문법·어휘 오류가 있으면 부드럽게 교정하되, 기를 꺾지 마세요.',
    '2. 매 턴 정확히 아래 JSON 형식으로만 응답하세요. JSON 외 텍스트 금지:',
    '{"reply":"학습 언어로 된 튜터 발화(짧게)","replyKo":"한국어 도움 요약 1줄",',
    ' "correction":{"original":"...","corrected":"...","explainKo":"한국어 설명"} 또는 null,',
    ' "newWords":[{"word":"...","meaning":"한국어 뜻"}] (0~3개, 없으면 빈 배열)}',
    '3. reply 는 반드시 후속 질문으로 끝내 대화를 이어가세요.',
    '4. 일본어 N5~N4 학습자에게는 かな 표기에 로마자 발음을 괄호로 병기하세요.'
  ].join('\n');
}

/** LLM JSON 응답 파싱 (코드펜스 제거 포함). 실패 시 원문을 reply 로 사용. */
export function parseTutorJson(raw: string): { reply: string; replyKo?: string; correction?: Correction | null; newWords?: { word: string; meaning: string }[] } {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const obj = JSON.parse(cleaned.slice(start, end + 1));
      if (typeof obj.reply === 'string') return obj;
    }
  } catch {
    /* 파싱 실패 → 원문 사용 */
  }
  return { reply: raw, correction: null, newWords: [] };
}

/* ───────────────────────── 오프라인 튜터 ───────────────────────── */

/**
 * OfflineTutor — 스크립트 기반 규칙 튜터.
 * 한계(정직 고지): 자유 주제를 이해하지 못하며 커리큘럼 스크립트를 순서대로 진행한다.
 * Gemini 키가 설정되면 services/ai.ts 가 자동으로 이 엔진 대신 LLM 을 사용한다.
 */
export class OfflineTutor {
  private unit: CurriculumUnit;
  private step = 0;
  private wrongTries = 0;

  constructor(unit: CurriculumUnit) {
    this.unit = unit;
  }

  /** 첫 튜터 발화 */
  opening(): ChatMessage {
    const t = this.unit.script[0];
    return { role: 'tutor', text: t.tutor, correction: undefined, newWords: this.unit.vocab.slice(0, 2), ts: Date.now() };
  }

  openingKo(): string {
    return this.unit.script[0]?.tutorKo ?? '';
  }

  /** 학습자 입력에 대한 다음 발화. done=true 면 단원 종료. */
  respond(learnerText: string): { message: ChatMessage; helpKo: string; done: boolean; matched: boolean } {
    const current = this.unit.script[this.step];
    const lower = learnerText.toLowerCase();
    const matched =
      !current.expect || current.expect.length === 0 ||
      current.expect.some((k) => lower.includes(k.toLowerCase()));

    if (!matched && this.wrongTries < 1 && current.hint) {
      // 첫 실패: 힌트 제공, 같은 단계 유지
      this.wrongTries += 1;
      return {
        message: { role: 'tutor', text: current.tutor, ts: Date.now() },
        helpKo: `💡 힌트: ${current.hint}`,
        done: false,
        matched: false
      };
    }

    // 다음 단계로 진행
    this.wrongTries = 0;
    this.step += 1;
    if (this.step >= this.unit.script.length) {
      return {
        message: { role: 'tutor', text: this.unit.language === 'en' ? 'Great job today! Lesson complete. 🎉' : 'よくできました！レッスン完了です。🎉', ts: Date.now() },
        helpKo: '단원 완료! 수고했어요.',
        done: true,
        matched
      };
    }
    const next = this.unit.script[this.step];
    const isLast = this.step === this.unit.script.length - 1 && (!next.expect || next.expect.length === 0);
    return {
      message: { role: 'tutor', text: next.tutor, ts: Date.now() },
      helpKo: next.tutorKo,
      done: isLast,
      matched
    };
  }
}

/* ───────────────────────── 간이 교정 규칙 ───────────────────────── */

/**
 * quickCorrect — 규칙 기반 간이 교정 (오프라인 모드 보조).
 * 대표적 초급 오류 패턴만 다룬다. LLM 모드에서는 LLM 교정이 우선한다.
 */
export function quickCorrect(language: Language, text: string): Correction | null {
  if (language === 'en') {
    const rules: { re: RegExp; fix: (m: RegExpMatchArray) => string; explain: string }[] = [
      { re: /\bi am agree\b/i, fix: () => 'I agree', explain: '"agree"는 동사라서 be동사 없이 "I agree" 로 씁니다.' },
      { re: /\bhe don't\b/i, fix: () => "he doesn't", explain: '3인칭 단수 주어에는 doesn\'t 를 씁니다.' },
      { re: /\bshe don't\b/i, fix: () => "she doesn't", explain: '3인칭 단수 주어에는 doesn\'t 를 씁니다.' },
      { re: /\bi go (yesterday|last)\b/i, fix: (m) => `I went ${m[1]}`, explain: '과거 시점(yesterday 등)에는 과거형 went 를 씁니다.' },
      { re: /\bmore better\b/i, fix: () => 'better', explain: 'better 자체가 비교급이라 more 를 붙이지 않습니다.' },
      { re: /\bpeoples\b/i, fix: () => 'people', explain: 'people 은 이미 복수형입니다.' }
    ];
    for (const r of rules) {
      const m = text.match(r.re);
      if (m) return { original: m[0], corrected: r.fix(m), explainKo: r.explain };
    }
  } else {
    const rules: { re: RegExp; fix: string; explain: string }[] = [
      { re: /ですです/, fix: 'です', explain: 'です는 한 번만 씁니다.' },
      { re: /ますです/, fix: 'ます', explain: '동사 ます형 뒤에는 です를 붙이지 않습니다.' },
      { re: /をは/, fix: 'は', explain: '조사 を와 は는 함께 쓰지 않습니다.' }
    ];
    for (const r of rules) {
      const m = text.match(r.re);
      if (m) return { original: m[0], corrected: r.fix, explainKo: r.explain };
    }
  }
  return null;
}
