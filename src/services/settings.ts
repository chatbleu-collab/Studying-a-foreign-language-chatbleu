/*
 * services/settings.ts — 앱 설정 (LocalStorage)
 * 목적: Gemini API 키(사용자 직접 발급·기기 로컬 저장), 모델명, 테마, TTS 속도 관리.
 * 보안 원칙(api-registry 스킬 준수):
 *   - 키는 사용자가 직접 발급해 입력한 것만 저장한다. 앱이 키를 생성·추측하지 않는다.
 *   - 키는 이 기기의 LocalStorage 에만 저장되며, Google API 호출 외에는 어디에도 전송되지 않는다.
 * 의존성: types/models.ts
 */
import { AppSettings } from '../types/models';

const KEY = 'alc-settings-v1';

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash', // 모델명이 변경되면 설정 화면에서 수정 가능
  theme: 'dark',
  ttsRate: 0.85
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
