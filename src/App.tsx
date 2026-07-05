/*
 * App.tsx — 루트 컴포넌트
 * 역할: 상태 기반 라우팅 스위치(store/AppContext.Route) + 하단 탭 네비게이션.
 *       외부 링크/새 탭을 열지 않으며 모든 이동은 앱 내부 상태 전환.
 * 의존성: store/AppContext.tsx, pages/*
 */
import React from 'react';
import { useApp } from './store/AppContext';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Conversation from './pages/Conversation';
import Quiz from './pages/Quiz';
import AudioPractice from './pages/AudioPractice';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

export default function App() {
  const { route, loading, navigate, profile } = useApp();

  if (loading) {
    return <div className="page center-page"><div className="hero-icon">🗣️</div><p className="muted">불러오는 중…</p></div>;
  }

  let page: React.ReactNode;
  switch (route.name) {
    case 'onboarding': page = <Onboarding />; break;
    case 'conversation': page = <Conversation key={`${route.mode}-${route.scenarioKey ?? ''}`} mode={route.mode} scenarioKey={route.scenarioKey} />; break;
    case 'quiz': page = <Quiz key={route.kind} kind={route.kind} />; break;
    case 'audio': page = <AudioPractice key={route.mode} mode={route.mode} />; break;
    case 'progress': page = <Progress />; break;
    case 'settings': page = <Settings />; break;
    default: page = <Home />;
  }

  const showNav = profile?.placementDone && route.name !== 'onboarding' && route.name !== 'conversation';

  return (
    <div className="app">
      {page}
      {showNav && (
        <nav className="bottom-nav">
          <button className={route.name === 'home' ? 'active' : ''} onClick={() => navigate({ name: 'home' })}>🏠<span>홈</span></button>
          <button className={route.name === 'progress' ? 'active' : ''} onClick={() => navigate({ name: 'progress' })}>📊<span>리포트</span></button>
          <button className={route.name === 'settings' ? 'active' : ''} onClick={() => navigate({ name: 'settings' })}>⚙️<span>설정</span></button>
        </nav>
      )}
    </div>
  );
}
