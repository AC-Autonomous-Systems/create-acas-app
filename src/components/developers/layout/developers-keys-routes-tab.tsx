'use client';
import { TenantContext } from '@/app/tenant-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';

export default function DevelopersRoutesTab() {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const pathname = usePathname();
  const nextRouter = useRouter();

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { selectedTenant } = useContext(TenantContext);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Tabs
      value={pathname}
      onValueChange={(newVall) => {
        nextRouter.push(
          newVall + (selectedTenant ? `?tenantId=${selectedTenant.id}` : '')
        );
      }}
    >
      <TabsList>
        <TabsTrigger value="/developers">Overview</TabsTrigger>
        <TabsTrigger value="/developers/api-keys">API Keys</TabsTrigger>
        <TabsTrigger value="/developers/logs">Logs</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
