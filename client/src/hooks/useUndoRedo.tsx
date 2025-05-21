import { useCallback, useState } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [undoStack, setUndoStack] = useState<T[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const update = useCallback((newState: T) => {
    setUndoStack((prev) => [...prev, state]);
    setRedoStack([]);
    setState(newState);
  }, [state]);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((redo) => [state, ...redo]);
      setState(last);
      return prev.slice(0, -1);
    });
  }, [state]);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setUndoStack((undo) => [...undo, state]);
      setState(next);
      return prev.slice(1);
    });
  }, [state]);

  return { state, set: update, undo, redo };
}
