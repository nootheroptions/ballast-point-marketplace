'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';

interface PageHeaderSaveState {
  onSave: (() => void | Promise<void>) | null;
  isSaving: boolean;
  isDisabled: boolean;
}

interface PageHeaderContextValue extends PageHeaderSaveState {
  registerSave: (handler: () => void | Promise<void>) => void;
  unregisterSave: () => void;
  setIsSaving: (saving: boolean) => void;
  setIsDisabled: (disabled: boolean) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [saveState, setSaveState] = useState<PageHeaderSaveState>({
    onSave: null,
    isSaving: false,
    isDisabled: true,
  });

  const registerSave = useCallback((handler: () => void | Promise<void>) => {
    setSaveState((prev) => (prev.onSave === handler ? prev : { ...prev, onSave: handler }));
  }, []);

  const unregisterSave = useCallback(() => {
    setSaveState((prev) => (prev.onSave === null ? prev : { ...prev, onSave: null }));
  }, []);

  const setIsSaving = useCallback((isSaving: boolean) => {
    setSaveState((prev) => (prev.isSaving === isSaving ? prev : { ...prev, isSaving }));
  }, []);

  const setIsDisabled = useCallback((isDisabled: boolean) => {
    setSaveState((prev) => (prev.isDisabled === isDisabled ? prev : { ...prev, isDisabled }));
  }, []);

  return (
    <PageHeaderContext.Provider
      value={{
        ...saveState,
        registerSave,
        unregisterSave,
        setIsSaving,
        setIsDisabled,
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeaderSave() {
  const context = useContext(PageHeaderContext);
  return context;
}

export function useRegisterPageHeaderSave(
  onSave: () => void | Promise<void>,
  isSaving: boolean,
  isDisabled: boolean
) {
  const context = usePageHeaderSave();
  const onSaveRef = useRef(onSave);
  const registerSave = context?.registerSave;
  const unregisterSave = context?.unregisterSave;
  const setIsSaving = context?.setIsSaving;
  const setIsDisabled = context?.setIsDisabled;

  // Keep ref in sync with latest onSave - using useEffect to avoid lint warning
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Register a stable callback that delegates to the ref
  useEffect(() => {
    if (!registerSave || !unregisterSave) return;
    const stableHandler = () => onSaveRef.current();
    registerSave(stableHandler);
    return () => unregisterSave();
  }, [registerSave, unregisterSave]);

  useEffect(() => {
    if (!setIsSaving) return;
    setIsSaving(isSaving);
  }, [setIsSaving, isSaving]);

  useEffect(() => {
    if (!setIsDisabled) return;
    setIsDisabled(isDisabled);
  }, [setIsDisabled, isDisabled]);
}
