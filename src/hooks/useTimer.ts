import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  onStart?: () => void;
  onPause?: () => void;
  onEnd?: (elapsed: number) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, clearTimer]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes.toString().padStart(2, '0')}m`);
  parts.push(`${seconds.toString().padStart(2, '0')}s`);
  const formattedTime = parts.join(' ');

  const start = useCallback(() => {
    setIsRunning(true);
    options.onStart?.();
  }, [options]);

  const pause = useCallback(() => {
    setIsRunning(false);
    options.onPause?.();
  }, [options]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
  }, []);

  const end = useCallback(() => {
    setIsRunning(false);
    options.onEnd?.(elapsed);
  }, [options, elapsed]);

  return { elapsed, isRunning, formattedTime, start, pause, reset, end };
}
