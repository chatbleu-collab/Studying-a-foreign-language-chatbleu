/*
 * pages/Settings.tsx — 설정
 * 구성:
 *   - Gemini API 키 입력(사용자 본인이 발급한 키만 사용 — 앱은 키를 생성/제공하지 않음)
 *   - 모델명 변경(기본 gemini-2.0-flash, Google 정책 변경 시 사용자가 직접 갱신 가능)
 *   - 테마(다크/라이트), TTS 속도
 *   - 언어 다시 시작(프로필 재생성), 전체 데이터 초기화
 * 주의: 새 탭 금지 규칙에 따라 키 발급 페이지는 링크가 아닌 '복사 가능한 주소 텍스트'로 안내.
 * 의존성: services/settings.ts, services/db.ts, store/AppContext.tsx
 */
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Btn, Card, Header } from '../components/ui';
import { dbClearCards, dbClearLogs, dbDeleteProfile } from '../services/db';
import { providerStatus } from '../services/ai';

const KEY_GUIDE_URL = 'https://aistudio.google.com/apikey';

export default function Settings() {
  const { profile, settings, updateSettings, navigate } = useApp();
  const [key, setKey] = useState(settings.geminiApiKey);
  const [model, setModel] = useState(settings.geminiModel);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveAi = () => {
    updateSettings({ ...settings, geminiApiKey: key.trim(), geminiModel: model.trim() || 'gemini-2.0-flash' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyUrl = () => {
    try { void navigator.clipboard.writeText(KEY_GUIDE_URL); } catch { /* 클립보드 미지원 시 무시 */ }
  };

  const restartLanguage = async () => {
    if (profile) await dbDeleteProfile(profile.language);
    navigate({ name: 'onboarding' });
    window.location.reload();
  };

  const resetAll = async () => {
    if (profile) {
      await dbDeleteProfile('en');
      await dbDeleteProfile('ja');
      await dbClearCards();
      await dbClearLogs();
    }
    localStorage.clear();
    window.location.reload();
  };

  const ai = providerStatus();

  return (
    <div className="page">
      <Header title="⚙️ 설정" />

      <Card>
        <b>🤖 AI 튜터 연결 (Gemini)</b>
        <p className="muted small">
          현재 상태: <b>{ai.provider === 'gemini' ? 'Gemini AI 연결됨' : '오프라인 스크립트 튜터'}</b><br />
          키가 없어도 커리큘럼 기반 오프라인 튜터로 학습할 수 있어요.
          자유로운 대화를 원하시면 Google AI Studio에서 <b>무료 API 키</b>를 직접 발급해 아래에 입력해 주세요.
        </p>
        <div className="muted small">발급 주소 (복사해서 브라우저 주소창에 붙여넣기):</div>
        <div className="url-box">
          <code>{KEY_GUIDE_URL}</code>
          <button className="btn btn-ghost" onClick={copyUrl}>복사</button>
        </div>
        <label className="field">
          <span className="muted small">API 키</span>
          <input className="chat-input" type="password" value={key} placeholder="AIza… (본인이 발급한 키)" onChange={(e) => setKey(e.target.value)} />
        </label>
        <label className="field">
          <span className="muted small">모델명 (기본: gemini-2.0-flash — 무료 티어는 Flash 계열)</span>
          <input className="chat-input" value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
        <Btn full onClick={saveAi}>{saved ? '저장됨 ✅' : '저장'}</Btn>
        <p className="muted tiny">키는 이 기기의 브라우저(LocalStorage)에만 저장되며 외부로 전송되지 않아요. Google 무료 티어 한도를 초과하면 자동으로 오프라인 튜터로 전환됩니다.</p>
      </Card>

      <Card>
        <b>🎨 화면 · 음성</b>
        <div className="field-row">
          <span>테마</span>
          <div className="grade-row">
            <button className={`btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => updateSettings({ ...settings, theme: 'dark' })}>🌙 다크</button>
            <button className={`btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => updateSettings({ ...settings, theme: 'light' })}>☀️ 라이트</button>
          </div>
        </div>
        <div className="field-row">
          <span>말하기 속도: {settings.ttsRate.toFixed(2)}x</span>
          <input type="range" min={0.5} max={1.2} step={0.05} value={settings.ttsRate}
            onChange={(e) => updateSettings({ ...settings, ttsRate: Number(e.target.value) })} />
        </div>
      </Card>

      <Card>
        <b>🌐 학습 언어</b>
        <p className="muted small">현재: {profile ? (profile.language === 'en' ? '영어' : '일본어') : '없음'} {profile && `(${profile.level})`}</p>
        <Btn full kind="ghost" onClick={() => void restartLanguage()}>언어 다시 선택 / 레벨 테스트 다시 하기</Btn>
        <p className="muted tiny">현재 언어의 프로필이 초기화되고 처음부터 다시 시작해요.</p>
      </Card>

      <Card>
        <b>🗑️ 데이터 초기화</b>
        {!confirmReset ? (
          <Btn full kind="danger" onClick={() => setConfirmReset(true)}>전체 데이터 삭제</Btn>
        ) : (
          <>
            <p className="muted small">정말 삭제할까요? 프로필·단어장·학습 기록·설정이 모두 사라지고 되돌릴 수 없어요.</p>
            <div className="grade-row">
              <Btn kind="ghost" onClick={() => setConfirmReset(false)}>취소</Btn>
              <Btn kind="danger" onClick={() => void resetAll()}>네, 모두 삭제</Btn>
            </div>
          </>
        )}
      </Card>

      <p className="muted tiny center">AI Language Coach v1.0 — 모든 데이터는 이 기기 안에만 저장됩니다.</p>
    </div>
  );
}
