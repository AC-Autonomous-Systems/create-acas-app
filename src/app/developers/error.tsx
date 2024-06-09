'use client'; // Error components must be Client Components

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeveloperError({
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
    <div className="w-full h-[90vh] flex flex-col items-center justify-center gap-8 px-10">
      <h3>{error.message}</h3>
      <Button
        className="min-w-[200px]"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => {
            nextRouter.push('/create-tenant');
          }
        }
      >
        Create Tenant
      </Button>
      <Button
        className="min-w-[200px]"
        variant="secondary"
        onClick={() => nextRouter.push('/')}
      >
        Back to homepage
      </Button>
    </div>
  );
}
