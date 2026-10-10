import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { storage } from '../services/storage';
import { reducer } from '../services/reducer';
import { useToast } from './useToast';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, undefined, () => storage.load());
  const first = useRef(true);

  // Persistência centralizada: qualquer alteração de estado é gravada.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ok = storage.save(state);
    if (!ok) toast.error('Não foi possível salvar os dados neste navegador.');
  }, [state, toast]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      resetAll: () => dispatch({ type: 'REPLACE', state: storage.reset() }),
      importData: (text) => dispatch({ type: 'REPLACE', state: storage.importJSON(text) }),
      exportData: () => storage.exportJSON(state),
    }),
    [state]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return ctx;
};
