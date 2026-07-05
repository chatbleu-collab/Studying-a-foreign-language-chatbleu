/*
 * types/models.ts — 데이터 모델 단일 정의 파일
 * 목적: 앱 전체(엔진·서비스·UI)가 공유하는 타입의 유일한 출처.
 * 의존성: 없음. 다른 모든 모듈이 이 파일에 의존한다.
 * 세션 재개 시: 새 기능은 반드시 여기에 타입을 먼저 추가한 뒤 구현할 것.
 */

/** 학습 대상 언어 */
export type Language = 'en' | 'ja';

/** 레벨 코드 — 영어는 CEFR, 일본어는 JLPT 기준 */
export type EnLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
export type JaLevel = 'N5' | 'N4' | 'N3' | 'N2';
export type LevelCode = EnLevel | JaLevel;

/** 레벨 순서 정의 (난이도 조절/승급 판단에 사용) */
export const EN_LEVELS: EnLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
export const JA_LEVELS: JaLevel[] = ['N5', 'N4', 'N3', 'N2'];

/** 레슨 모드 12종 + 배치 테스트 */
export type LessonMode =
  | 'free-conversation'
  | 'guided-lesson'
  | 'role-play'
  | 'pronunciation'
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'speaking-challenge'
  | 'daily-mission'
  | 'jlpt'
  | 'toeic'
  | 'travel'
  | 'placement';

/** 커리큘럼 단원 */
export interface CurriculumUnit {
  id: string;               // 예: 'en-a0-greetings'
  language: Language;
  level: LevelCode;
  title: string;            // 한국어 제목
  topic: string;            // 영어/일본어 토픽명 (AI 프롬프트에 사용)
  vocab: VocabItem[];       // 단원 목표 어휘
  patterns: string[];       // 핵심 문형
  /** 오프라인 스크립트 엔진용 대화 시드: 튜터 발화 순서 */
  script: ScriptTurn[];
}

/** 오프라인 대화 스크립트의 튜터 한 턴 */
export interface ScriptTurn {
  tutor: string;            // 튜터 발화(학습 언어)
  tutorKo: string;          // 한국어 도움말
  expect?: string[];        // 학습자 답에 기대하는 키워드(소문자) — 포함 시 칭찬
  hint?: string;            // 막힐 때 힌트
}

/** 어휘 항목 (SRS 카드의 원본) */
export interface VocabItem {
  word: string;             // 표기 (일본어는 かな 포함 표기)
  reading?: string;         // 일본어 읽기(로마자/かな)
  meaning: string;          // 한국어 뜻
  example?: string;         // 예문
}

/** SRS 카드 상태 (SM-2 간이형) */
export interface SrsCard {
  id: string;               // `${language}:${word}`
  language: Language;
  item: VocabItem;
  interval: number;         // 일 단위
  ease: number;             // 난이도 계수 (기본 2.5)
  reps: number;             // 연속 성공 횟수
  due: string;              // ISO 날짜 — 이 날짜 이후 복습 대상
  learnedAt: string;        // 최초 학습일
}

/** 퀴즈 문항 (배치·문법·JLPT·TOEIC 공용) */
export interface QuizQuestion {
  id: string;
  language: Language;
  level: LevelCode;
  kind: 'placement' | 'grammar' | 'jlpt' | 'toeic' | 'vocab';
  prompt: string;           // 문제 지문
  choices: string[];        // 4지선다
  answer: number;           // 정답 인덱스
  explain: string;          // 한국어 해설
}

/** 대화 메시지 */
export interface ChatMessage {
  role: 'tutor' | 'learner' | 'system';
  text: string;
  /** 튜터 교정 블록(있을 때만) */
  correction?: Correction;
  newWords?: VocabItem[];
  ts: number;
}

/** 교정 결과 */
export interface Correction {
  original: string;
  corrected: string;
  explainKo: string;        // 한국어로 왜 고쳤는지 설명
}

/** 학습자 프로필 — IndexedDB 'profile' 스토어에 저장 */
export interface LearnerProfile {
  language: Language;
  level: LevelCode;
  /** 0~100. 100 도달 시 다음 레벨 승급 */
  levelProgress: number;
  xp: number;
  streak: number;
  lastStudyDate: string;    // 'YYYY-MM-DD'
  lessonsCompleted: number;
  vocabLearned: number;
  grammarMastered: string[];
  weakAreas: string[];      // 최근 자주 틀린 영역 태그
  pronunciationScores: number[]; // 최근 발음 점수(0~100) 이력
  placementDone: boolean;
  currentUnitIndex: number; // 가이드 레슨 진행 위치
  createdAt: string;
}

/** 일별 학습 로그 — 리포트 생성용 */
export interface DailyLog {
  date: string;             // 'YYYY-MM-DD' (키)
  language: Language;
  xp: number;
  lessons: number;
  newWords: number;
  mistakes: string[];       // 그날 발생한 오류 요약
  minutes: number;
}

/** AI 제공자 상태 (api-registry 패턴: 자동 폴백 체인) */
export interface AiProviderStatus {
  provider: 'gemini' | 'offline';
  reason: string;           // 현재 제공자가 선택된 이유
}

/** 앱 설정 — LocalStorage 저장 (키 값은 기기 로컬에만 존재) */
export interface AppSettings {
  geminiApiKey: string;     // 사용자가 직접 발급해 입력. 외부 전송은 Google API 호출에만 사용.
  geminiModel: string;      // 기본 'gemini-2.0-flash' (설정에서 변경 가능)
  theme: 'dark' | 'light';
  ttsRate: number;          // 0.5~1.2 (초보자용 느린 발화)
}
