'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  Dispatch,
} from 'react';
import { P5jsContainer } from '@/components/p5jsContainer';
import { AppReducer, initialState } from './context/AppReducer';

interface AppContextState {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext({} as AppContextState);

const Wrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <P5jsContainer />
    </AppContext.Provider>
  );
};

export default Wrapper;

export function useAppContext() {
  return useContext(AppContext);
}
