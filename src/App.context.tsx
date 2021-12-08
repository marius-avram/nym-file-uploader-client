import React, {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';

export const AppContext = createContext<AppContextType>(null as any);

export type AppStateType = {
  fileListUpdatedCount: number,
};

export type AppContextType = {
  state: AppStateType,
  setFileListUpdatedCount: (fileListUpdatedCount: number) => void;
};

export function AppProvider(props: any) {
  const [state, setState] = useState<AppStateType>({
    fileListUpdatedCount: 0
  });

  const setFileListUpdatedCount = useCallback((fileListUpdatedCount: number) => {
    setState((current: AppStateType) => ({
      ...current,
      fileListUpdatedCount
    }));
  }, []);

  const value: AppContextType = {
    state,
    setFileListUpdatedCount
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  return useContext(AppContext);
}
