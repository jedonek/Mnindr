import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Hlídá neuložené změny. Při navigaci pryč (i zavření záložky) vrátí blocker,
 * ze kterého se vykreslí potvrzovací dialog (viz <UnsavedChangesDialog />).
 */
export function useUnsavedChanges(dirty: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return blocker;
}
