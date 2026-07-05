/*
 * data/quizzes.ts — 퀴즈 문항 데이터
 * 목적: 배치 테스트·문법 트레이너·JLPT·TOEIC 연습 문항 공급.
 * 의존성: types/models.ts
 * 확장 방법(다음 세션): QUESTIONS 배열에 QuizQuestion 을 추가하면 kind별 화면에 자동 반영.
 *   배치 테스트는 level 필드로 채점 가중치가 결정된다(engine/level.ts 참조).
 */
import { QuizQuestion } from '../types/models';

export const QUESTIONS: QuizQuestion[] = [
  // ── 영어 배치 테스트 (A0→B2 순, 레벨당 2~3문항) ──
  { id: 'pe1', language: 'en', level: 'A0', kind: 'placement', prompt: '"안녕하세요, 만나서 반갑습니다"는?', choices: ['Hello, nice to meet you.', 'Goodbye, see you.', 'How much is this?', 'I am hungry.'], answer: 0, explain: '첫 만남 인사는 "Nice to meet you." 입니다.' },
  { id: 'pe2', language: 'en', level: 'A0', kind: 'placement', prompt: 'I ___ from Korea.', choices: ['am', 'is', 'are', 'be'], answer: 0, explain: '주어가 I 일 때 be동사는 am 입니다.' },
  { id: 'pe3', language: 'en', level: 'A1', kind: 'placement', prompt: 'What time ___ you get up?', choices: ['do', 'does', 'are', 'is'], answer: 0, explain: '일반동사 의문문에서 주어 you 는 do 를 씁니다.' },
  { id: 'pe4', language: 'en', level: 'A1', kind: 'placement', prompt: '"이 근처에 은행이 있나요?"에 가장 가까운 문장은?', choices: ['Is there a bank near here?', 'Where you bank?', 'Bank is where?', 'Do bank here?'], answer: 0, explain: '"Is there ~ near here?" 가 자연스러운 표현입니다.' },
  { id: 'pe5', language: 'en', level: 'A2', kind: 'placement', prompt: 'I have ___ been to Japan twice.', choices: ['already', 'yet', 'never', 'ago'], answer: 0, explain: '경험을 말하는 현재완료에서 "이미 두 번" → already.' },
  { id: 'pe6', language: 'en', level: 'A2', kind: 'placement', prompt: 'If it rains tomorrow, I ___ stay home.', choices: ['will', 'would', 'did', 'was'], answer: 0, explain: '조건문 1형식: If + 현재, will + 동사원형.' },
  { id: 'pe7', language: 'en', level: 'B1', kind: 'placement', prompt: 'The report ___ by the team yesterday.', choices: ['was finished', 'finished', 'has finish', 'is finishing'], answer: 0, explain: '과거 수동태: was/were + 과거분사.' },
  { id: 'pe8', language: 'en', level: 'B1', kind: 'placement', prompt: 'She asked me ___ I could help her.', choices: ['if', 'that', 'what', 'do'], answer: 0, explain: '간접의문문에서 yes/no 질문은 if/whether 로 연결합니다.' },
  { id: 'pe9', language: 'en', level: 'B2', kind: 'placement', prompt: '___ had I arrived when the meeting started.', choices: ['Hardly', 'Almost', 'Nearly', 'Mostly'], answer: 0, explain: '도치 구문 "Hardly had S p.p. when ~" (~하자마자).' },
  { id: 'pe10', language: 'en', level: 'B2', kind: 'placement', prompt: 'The proposal was rejected, ___ surprised everyone.', choices: ['which', 'that', 'what', 'who'], answer: 0, explain: '앞 문장 전체를 받는 계속적 용법 관계대명사는 which.' },

  // ── 일본어 배치 테스트 ──
  { id: 'pj1', language: 'ja', level: 'N5', kind: 'placement', prompt: '「こんにちは」의 뜻은?', choices: ['안녕하세요(낮)', '감사합니다', '죄송합니다', '잘 자요'], answer: 0, explain: 'こんにちは는 낮 인사입니다.' },
  { id: 'pj2', language: 'ja', level: 'N5', kind: 'placement', prompt: '「みず」는 무엇일까요?', choices: ['물', '밥', '집', '친구'], answer: 0, explain: 'みず(mizu) = 물.' },
  { id: 'pj3', language: 'ja', level: 'N5', kind: 'placement', prompt: '"나는 학생입니다" = わたしは がくせい___。', choices: ['です', 'ます', 'から', 'まで'], answer: 0, explain: '명사문의 정중형 어미는 です.' },
  { id: 'pj4', language: 'ja', level: 'N4', kind: 'placement', prompt: '"영화를 봤습니다" = えいがを み___。', choices: ['ました', 'ます', 'たいです', 'ません'], answer: 0, explain: '과거 정중형은 〜ました.' },
  { id: 'pj5', language: 'ja', level: 'N4', kind: 'placement', prompt: '「これは いくらですか」의 뜻은?', choices: ['이것은 얼마입니까?', '이것은 무엇입니까?', '어디입니까?', '몇 시입니까?'], answer: 0, explain: 'いくら = 얼마.' },
  { id: 'pj6', language: 'ja', level: 'N3', kind: 'placement', prompt: '"일본에 가 본 적이 있습니다" = にほんへ いった___ あります。', choices: ['ことが', 'ものが', 'ところが', 'ときが'], answer: 0, explain: '경험 표현: 동사た형 + ことが あります.' },
  { id: 'pj7', language: 'ja', level: 'N3', kind: 'placement', prompt: '「〜と おもいます」의 기능은?', choices: ['자기 생각 말하기', '명령하기', '금지하기', '과거 표현'], answer: 0, explain: '〜と おもいます = ~라고 생각합니다.' },
  { id: 'pj8', language: 'ja', level: 'N2', kind: 'placement', prompt: '비즈니스에서 "확인해 주실 수 있습니까?"의 겸양 표현은?', choices: ['ごかくにん いただけますか', 'かくにんしろ', 'かくにんする?', 'かくにんです'], answer: 0, explain: 'いただけますか 는 정중한 의뢰 표현입니다.' },

  // ── 영어 문법 트레이너 ──
  { id: 'ge1', language: 'en', level: 'A0', kind: 'grammar', prompt: 'She ___ a teacher.', choices: ['is', 'am', 'are', 'be'], answer: 0, explain: '3인칭 단수 주어 + is.' },
  { id: 'ge2', language: 'en', level: 'A0', kind: 'grammar', prompt: 'They ___ my friends.', choices: ['are', 'is', 'am', 'be'], answer: 0, explain: '복수 주어 + are.' },
  { id: 'ge3', language: 'en', level: 'A1', kind: 'grammar', prompt: 'He ___ coffee every morning.', choices: ['drinks', 'drink', 'drinking', 'drank'], answer: 0, explain: '3인칭 단수 현재는 동사에 -s.' },
  { id: 'ge4', language: 'en', level: 'A1', kind: 'grammar', prompt: 'I ___ to the park yesterday.', choices: ['went', 'go', 'goes', 'going'], answer: 0, explain: 'yesterday → 과거형 went.' },
  { id: 'ge5', language: 'en', level: 'A2', kind: 'grammar', prompt: 'This bag is ___ than that one.', choices: ['cheaper', 'cheap', 'cheapest', 'more cheap'], answer: 0, explain: '1음절 형용사 비교급은 -er.' },
  { id: 'ge6', language: 'en', level: 'A2', kind: 'grammar', prompt: 'I have lived here ___ 2020.', choices: ['since', 'for', 'from', 'at'], answer: 0, explain: '시작 시점 + since, 기간 + for.' },
  { id: 'ge7', language: 'en', level: 'B1', kind: 'grammar', prompt: 'If I ___ rich, I would travel the world.', choices: ['were', 'am', 'will be', 'be'], answer: 0, explain: '가정법 과거: If I were ~, I would ~.' },
  { id: 'ge8', language: 'en', level: 'B1', kind: 'grammar', prompt: 'The man ___ lives next door is a doctor.', choices: ['who', 'which', 'whose', 'whom'], answer: 0, explain: '사람 주격 관계대명사는 who.' },

  // ── 일본어 문법 트레이너 ──
  { id: 'gj1', language: 'ja', level: 'N5', kind: 'grammar', prompt: 'ごはん___ たべます。', choices: ['を', 'は', 'が', 'に'], answer: 0, explain: '목적어 조사는 を.' },
  { id: 'gj2', language: 'ja', level: 'N5', kind: 'grammar', prompt: 'わたし___ かんこくじんです。', choices: ['は', 'を', 'で', 'へ'], answer: 0, explain: '주제 조사는 は.' },
  { id: 'gj3', language: 'ja', level: 'N4', kind: 'grammar', prompt: 'きのう えいが___ みました。', choices: ['を', 'に', 'は', 'と'], answer: 0, explain: '"영화를 보다" — 목적어 조사 を.' },
  { id: 'gj4', language: 'ja', level: 'N4', kind: 'grammar', prompt: 'にほんへ いき___です。(가고 싶습니다)', choices: ['たい', 'ます', 'ました', 'ません'], answer: 0, explain: '희망 표현: ます형 어간 + たいです.' },
  { id: 'gj5', language: 'ja', level: 'N3', kind: 'grammar', prompt: 'あした あめが ふる___ おもいます。', choices: ['と', 'を', 'が', 'で'], answer: 0, explain: '생각 인용: 〜と おもいます.' },

  // ── TOEIC 연습 (영어) ──
  { id: 'te1', language: 'en', level: 'A2', kind: 'toeic', prompt: 'Part 5: All employees must ___ their ID badges at all times.', choices: ['wear', 'wears', 'wearing', 'worn'], answer: 0, explain: '조동사 must + 동사원형.' },
  { id: 'te2', language: 'en', level: 'B1', kind: 'toeic', prompt: 'Part 5: The meeting has been ___ until next Friday.', choices: ['postponed', 'postpone', 'postponing', 'postpones'], answer: 0, explain: '현재완료 수동태: has been + p.p.' },
  { id: 'te3', language: 'en', level: 'B1', kind: 'toeic', prompt: 'Part 5: Please review the attached document ___ the meeting.', choices: ['before', 'while', 'during when', 'until when'], answer: 0, explain: '명사구 앞 전치사 before.' },
  { id: 'te4', language: 'en', level: 'B2', kind: 'toeic', prompt: 'Part 5: ___ the heavy rain, the outdoor event proceeded as planned.', choices: ['Despite', 'Although', 'Because', 'Even'], answer: 0, explain: '명사구 앞 양보 전치사는 Despite (Although는 절 앞).' },

  // ── JLPT 연습 (일본어) ──
  { id: 'je1', language: 'ja', level: 'N5', kind: 'jlpt', prompt: 'N5 어휘: 「ともだち」의 뜻은?', choices: ['친구', '가족', '선생님', '학생'], answer: 0, explain: 'ともだち = 친구.' },
  { id: 'je2', language: 'ja', level: 'N5', kind: 'jlpt', prompt: 'N5 문법: きょう___ あついです。(오늘은 덥습니다)', choices: ['は', 'を', 'へ', 'で'], answer: 0, explain: '주제 조사 は.' },
  { id: 'je3', language: 'ja', level: 'N4', kind: 'jlpt', prompt: 'N4 문법: でんしゃに のり___ しました。(타는 것으로 했습니다 → 늦었습니다 문맥 아님, "타기로 했습니다")', choices: ['ことに', 'ものに', 'ところに', 'ばかりに'], answer: 0, explain: '결정 표현: 동사 사전형 + ことに する.' },
  { id: 'je4', language: 'ja', level: 'N3', kind: 'jlpt', prompt: 'N3 문법: べんきょうすれば する___ じょうずに なります。', choices: ['ほど', 'まで', 'だけ', 'ぐらい'], answer: 0, explain: '〜ば〜ほど = ~하면 할수록.' }
];

export function questionsBy(kind: QuizQuestion['kind'], language: 'en' | 'ja'): QuizQuestion[] {
  return QUESTIONS.filter((q) => q.kind === kind && q.language === language);
}
