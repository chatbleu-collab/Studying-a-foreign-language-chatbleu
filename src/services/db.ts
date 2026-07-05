/*
 * services/db.ts — IndexedDB 래퍼 (외부 라이브러리 없이 순수 구현)
 * 목적: 학습자 프로필·SRS 카드·일별 로그의 영속 저장.
 * 스토어 구성:
 *   - profile: key = language('en'|'ja'), value = LearnerProfile
 *   - srs:     key = card.id, value = SrsCard
 *   - logs:    key = `${language}:${date}`, value = DailyLog
 * 의존성: types/models.ts
 * 주의: 스토어 추가/변경 시 DB_VERSION 을 올리고 onupgradeneeded 에 생성 코드를 추가할 것.
 */
import { DailyLog, Language, LearnerProfile, SrsCard } from '../types/models';

const DB_NAME = 'ai-language-coach';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
      if (!db.objectStoreNames.contains('srs')) db.createObjectStore('srs');
      if (!db.objectStoreNames.contains('logs')) db.createObjectStore('logs');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const r = fn(t.objectStore(store));
        r.onsuccess = () => resolve(r.result as T);
        r.onerror = () => reject(r.error);
      })
  );
}

/* ── 프로필 ── */
export const dbGetProfile = (lang: Language) => tx<LearnerProfile | undefined>('profile', 'readonly', (s) => s.get(lang));
export const dbPutProfile = (p: LearnerProfile) => tx<IDBValidKey>('profile', 'readwrite', (s) => s.put(p, p.language));
export const dbDeleteProfile = (lang: Language) => tx<undefined>('profile', 'readwrite', (s) => s.delete(lang));

/* ── SRS 카드 ── */
export const dbPutCard = (c: SrsCard) => tx<IDBValidKey>('srs', 'readwrite', (s) => s.put(c, c.id));
export const dbAllCards = () => tx<SrsCard[]>('srs', 'readonly', (s) => s.getAll());
export const dbClearCards = () => tx<undefined>('srs', 'readwrite', (s) => s.clear());

/* ── 일별 로그 ── */
export const dbGetLog = (lang: Language, date: string) => tx<DailyLog | undefined>('logs', 'readonly', (s) => s.get(`${lang}:${date}`));
export const dbPutLog = (lang: Language, log: DailyLog) => tx<IDBValidKey>('logs', 'readwrite', (s) => s.put(log, `${lang}:${log.date}`));
export const dbAllLogs = () => tx<DailyLog[]>('logs', 'readonly', (s) => s.getAll());
export const dbClearLogs = () => tx<undefined>('logs', 'readwrite', (s) => s.clear());
