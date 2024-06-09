'use client';

import { useContext, useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { Tenant } from '@/app/api/tenant/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { TenantContext } from '@/app/tenant-provider';
import { useRouter } from 'next/navigation';

type SelectTenantProps = {
  tenants: Tenant[];
};
export default function SelectTenant({ tenants }: SelectTenantProps) {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const { toast } = useToast();
  const nextRouter = useRouter();

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */

  const { selectedTenant, setSelectedTenant } = useContext(TenantContext);

  /* -------------------------------------------------------------------------- */
  /*                                   Effects                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (selectedTenant) {
      // Replace tenantId in the Query Param of the URL:
      const url = new URL(window.location.href);
      url.searchParams.set('tenantId', selectedTenant.id);
      window.localStorage.setItem('tenant', JSON.stringify(selectedTenant));
      // Nextrouter redirects to the new URL:
      nextRouter.replace(url.toString());
    }
  }, [nextRouter, selectedTenant]);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-w-[150px]">
      {tenants.length === 0 ? (
        // TODO: Add /create-tenant route.
        <Link href="/create-tenant">
          <Button
            className="w-full"
            variant="outline"
          >
            Add Tenant
          </Button>
        </Link>
      ) : (
        <Select
          value={selectedTenant ? `${selectedTenant.id}` : ''}
          onValueChange={(id) => {
            const tenant: Tenant | undefined = tenants.find(
              (tenant) => tenant.id === id
            );
            if (tenant) {
              window.localStorage.setItem('tenant', JSON.stringify(tenant));
              setSelectedTenant(tenant);
            }
          }}
        >
          <SelectTrigger className="border-none">
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => {
              return (
                <SelectItem
                  key={tenant.id}
                  value={`${tenant.id}`}
                >
                  {tenant.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}{' '}
    </div>
  );
}
