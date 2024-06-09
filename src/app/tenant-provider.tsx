'use client';

import { createContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Tenant } from './api/tenant/types';

type TenantContextType = {
  selectedTenant: Tenant | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
};
export const TenantContext = createContext<TenantContextType>(null!);

export default function TenantContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const storedLocation = window.localStorage.getItem('tenant');

    if (storedLocation) {
      setSelectedTenant(JSON.parse(storedLocation));
    }
  }, [setSelectedTenant]);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <TenantContext.Provider
      value={{
        selectedTenant,
        setSelectedTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
