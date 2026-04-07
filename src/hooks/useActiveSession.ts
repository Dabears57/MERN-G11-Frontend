import { useState, useEffect, useRef, useCallback } from 'react';
import { getSessionStatus } from '../api/sessions.ts';

export interface ActiveSessionInfo {
  status: 'no active session' | 'paused' | 'in-progress';
  projectId: string | null;
  projectName: string | null;
  elapsed: number; // seconds, locally maintained between polls
}

const SESSION_KEY = 'tt_active_session';

export function saveSessionMeta(projectId: string, projectName: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ projectId, projectName }));
}

export function clearSessionMeta() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getSessionMeta(): { projectId: string; projectName: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const POLL_INTERVAL_MS = 15_000;

export function useActiveSession() {
  const [info, setInfo] = useState<ActiveSessionInfo>({
    status: 'no active session',
    projectId: null,
    projectName: null,
    elapsed: 0,
  });

  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const stopTick = useCallback(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    if (tickRef.current !== null) return;
    tickRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setInfo((prev) => ({ ...prev, elapsed: elapsedRef.current }));
    }, 1000);
  }, []);

  const poll = useCallback(async () => {
    const res = await getSessionStatus();
    if (res.error || !res.data) return;
    const data = res.data;
    const meta = getSessionMeta();

    if (data.status === 'no active session') {
      stopTick();
      elapsedRef.current = 0;
      setInfo({ status: 'no active session', projectId: null, projectName: null, elapsed: 0 });
      return;
    }

    // Sync elapsed from backend
    elapsedRef.current = data.timeElapsedSecs;
    setInfo({
      status: data.status,
      projectId: data.all?.projectId?.toString() ?? meta?.projectId ?? null,
      projectName: meta?.projectName ?? null,
      elapsed: data.timeElapsedSecs,
    });

    if (data.status === 'in-progress') {
      startTick();
    } else {
      stopTick(); // paused — freeze local counter
    }
  }, [startTick, stopTick]);

  // Expose a manual refresh so other components can trigger after ending a session
  const refresh = useCallback(() => { poll(); }, [poll]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(id);
      stopTick();
    };
  }, [poll, stopTick]);

  return { info, refresh };
}

export function formatElapsed(secs: number): string {
  const h   = Math.floor(secs / 3600);
  const m   = Math.floor((secs % 3600) / 60);
  const s   = secs % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
