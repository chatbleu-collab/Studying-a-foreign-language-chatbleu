/*
 * store/AppContext.tsx — 전역 상태 (React Context)
 * 목적: 학습자 프로필·설정·화면 라우팅 상태를 앱 전체에 공급.
 *       모든 페이지는 useApp() 훅으로 접근한다.
 * 라우팅: 새 탭 금지 규칙에 따라 URL 라우터 없이 상태 기반 화면 전환(Route 타입)을 사용.
 * 의존성: types/models.ts, services/db.ts, services/settings.ts, engine/progress.ts, engine/srs.ts
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppSettings, DailyLog, Language, LearnerProfile, LessonMode } from '../types/models';
import { dbGetLog, dbGetProfile, dbPutLog, dbPutProfile } from '../services/db';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../services/settings';
import { appendLog, updateStreak } from '../engine/progress';
import { todayStr } from '../engine/srs';

/** 화면 라우트 — 페이지 추가 시 여기와 App.tsx 스위치에만 추가하면 된다 */
export type Route =
  | { name: 'home' }
  | { name: 'onboarding' }
  | { name: 'conversation'; mode: LessonMode; unitId?: string; scenarioKey?: string }
  | { name: 'quiz'; kind: 'grammar' | 'jlpt' | 'toeic' | 'vocab' }
  | { name: 'audio'; mode: 'pronunciation' | 'listening' | 'speaking-challenge' }
  | { name: 'progress' }
  | { name: 'settings' };

interface AppState {
  profile: LearnerProfile | null;
  settings: AppSettings;
  route: Route;
  loading: boolean;
  navigate: (r: Route) => void;
  setProfile: (p: LearnerProfile) => Promise<void>;
  updateSettings: (s: AppSettings) => void;
  /** 학습 활동 기록: XP 추가 + 스트릭 + 일별 로그 반영 */
  recordActivity: (xp: number, extra?: { lessons?: number; newWords?: number; minutes?: number; mistake?: string }) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<LearnerProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [loading, setLoading] = useState(true);

  // 초기 로드: 설정 → 프로필(en 우선, 없으면 ja) → 온보딩 여부 결정
  useEffect(() => {
    (async () => {
      const s = loadSettings();
      setSettings(s);
      document.documentElement.dataset.theme = s.theme;
      try {
        const en = await dbGetProfile('en');
        const ja = await dbGetProfile('ja');
        const p = en ?? ja ?? null;
        setProfileState(p);
        setRoute(p && p.placementDone ? { name: 'home' } : { name: 'onboarding' });
      } catch {
        setRoute({ name: 'onboarding' });
      }
      setLoading(false);
    })();
  }, []);

  const navigate = useCallback((r: Route) => {
    window.scrollTo(0, 0);
    setRoute(r);
  }, []);

  const setProfile = useCallback(async (p: LearnerProfile) => {
    setProfileState(p);
    await dbPutProfile(p);
  }, []);

  const updateSettings = useCallback((s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
    document.documentElement.dataset.theme = s.theme;
  }, []);

  const recordActivity = useCallback(
    async (xp: number, extra?: { lessons?: number; newWords?: number; minutes?: number; mistake?: string }) => {
      if (!profile) return;
      let p = updateStreak(profile);
      p = {
        ...p,
        xp: p.xp + xp,
        lessonsCompleted: p.lessonsCompleted + (extra?.lessons ?? 0),
        vocabLearned: p.vocabLearned + (extra?.newWords ?? 0)
      };
      if (extra?.mistake) p = { ...p, weakAreas: [...p.weakAreas.slice(-9), extra.mistake] };
      setProfileState(p);
      await dbPutProfile(p);
      const lang: Language = p.language;
      const existing = await dbGetLog(lang, todayStr());
      const log: DailyLog = appendLog(existing, lang, { xp, lessons: extra?.lessons, newWords: extra?.newWords, minutes: extra?.minutes }, extra?.mistake);
      await dbPutLog(lang, log);
    },
    [profile]
  );

  return (
    <Ctx.Provider value={{ profile, settings, route, loading, navigate, setProfile, updateSettings, recordActivity }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
