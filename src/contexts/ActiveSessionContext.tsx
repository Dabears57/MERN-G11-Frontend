import { createContext, useContext } from 'react';
import { useActiveSession } from '../hooks/useActiveSession.ts';
import type { ActiveSessionInfo } from '../hooks/useActiveSession.ts';

interface ActiveSessionContextValue {
  info: ActiveSessionInfo;
  refresh: () => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextValue | null>(null);

export function ActiveSessionProvider({ children }: { children: React.ReactNode }) {
  const { info, refresh } = useActiveSession();
  return (
    <ActiveSessionContext.Provider value={{ info, refresh }}>
      {children}
    </ActiveSessionContext.Provider>
  );
}

export function useActiveSessionContext(): ActiveSessionContextValue {
  const ctx = useContext(ActiveSessionContext);
  if (!ctx) throw new Error('useActiveSessionContext must be used within ActiveSessionProvider');
  return ctx;
}
