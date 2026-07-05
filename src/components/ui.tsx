/*
 * components/ui.tsx — 공용 UI 컴포넌트 (헤더/카드/버튼/뱃지)
 * 목적: 페이지 간 일관된 모바일 퍼스트 UI. 스타일은 src/styles.css 클래스 사용.
 * 의존성: store/AppContext.tsx (뒤로가기 네비게이션)
 */
import React from 'react';
import { useApp } from '../store/AppContext';

/** 상단 헤더 — 뒤로가기 + 제목. 새 탭 금지 규칙에 따라 앱 내 상태 전환만 사용 */
export function Header({ title, back = true }: { title: string; back?: boolean }) {
  const { navigate } = useApp();
  return (
    <header className="header">
      {back ? (
        <button className="icon-btn" aria-label="뒤로" onClick={() => navigate({ name: 'home' })}>←</button>
      ) : (
        <span className="icon-btn" aria-hidden>　</span>
      )}
      <h1>{title}</h1>
      <span className="icon-btn" aria-hidden>　</span>
    </header>
  );
}

export function Card({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <div className={`card ${onClick ? 'card-tap' : ''} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, kind = 'primary', disabled = false, full = false }: {
  children: React.ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; full?: boolean;
}) {
  return (
    <button className={`btn btn-${kind} ${full ? 'btn-full' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/** 진행 바 (0~100) */
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="pbar"><div className="pbar-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
  );
}
