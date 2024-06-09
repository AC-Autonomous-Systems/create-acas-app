'use client'; // Error components must be Client Components

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { TenantContext } from './tenant-provider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const nextRouter = useRouter();
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { selectedTenant } = useContext(TenantContext);
  /* -------------------------------------------------------------------------- */
  /*                                   Effects                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="w-full h-[90vh] flex flex-col items-center justify-center gap-8">
      {/* <h2>Something went wrong!</h2> */}
      <h3>{error.message}</h3>
      <Button
        variant="outline"
        onClick={
          // Append tenant Id to the URL:
          // Attempt to recover by trying to re-render the segment
          () => {
            if (selectedTenant) {
              const url = new URL(window.location.href);
              url.searchParams.set('tenantId', selectedTenant.id);
              window.history.replaceState({}, '', url.toString());
            }
            reset();
          }
        }
      >
        Retry
      </Button>
      <Button
        variant="outline"
        onClick={() => nextRouter.push('/')}
      >
        Back to homepage
      </Button>
    </div>
  );
}
