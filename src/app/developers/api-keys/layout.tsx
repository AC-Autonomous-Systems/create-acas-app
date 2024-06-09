import DevelopersRoutesTab from '@/components/developers/layout/developers-keys-routes-tab';
import Loading from '@/components/icons/loading';
import { Suspense } from 'react';

export default function Developers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[90vh]">
          <Loading />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
