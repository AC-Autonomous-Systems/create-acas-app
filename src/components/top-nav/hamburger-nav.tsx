'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  ArrowRightIcon,
  GitHubLogoIcon,
  HamburgerMenuIcon,
  PinRightIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { NavigationMenuItemDef } from './types';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useSession } from 'next-auth/react';
import { TenantContext } from '@/app/tenant-provider';
import { Session } from 'next-auth';
import { TenantsAndRole } from '@/app/api/tenant/types';

type HamburgerNavProps = {
  navigationMenuItems: NavigationMenuItemDef[];
  footerItems?: React.ReactNode;
  session: Session | null;
  tenantsAndRoles: TenantsAndRole[];
};

export default function HamburgerNav({
  navigationMenuItems,
  footerItems,
  session,
  tenantsAndRoles,
}: HamburgerNavProps) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const { selectedTenant } = useContext(TenantContext);
  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Sheet
      open={isNavMenuOpen}
      onOpenChange={(newVal) => {
        setIsNavMenuOpen(newVal);
      }}
    >
      <SheetTrigger>
        <HamburgerMenuIcon className="w-6 h-6 md:hidden" />
      </SheetTrigger>
      <SheetContent className="h-full flex flex-col justify-between">
        <ScrollArea className="mt-6">
          {navigationMenuItems.map((group) => {
            // Check for permissions:
            const groupPermissions = group.permissions;
            const groupTenantPermissions = group.tenantPermissions;

            // Check permissions at the app level:
            if (groupPermissions.length !== 0 && !session) {
              return <></>;
            } else if (
              groupPermissions.length !== 0 &&
              session &&
              groupPermissions.find(
                (permission) => permission === session.user.role
              ) === undefined
            ) {
              return <></>;
            }

            // Check permissions at the tenant level:
            if (groupTenantPermissions.length !== 0 && !selectedTenant) {
              return <></>;
            } else if (
              groupTenantPermissions.length !== 0 &&
              selectedTenant &&
              groupTenantPermissions.find((permission) => {
                const userRoles = tenantsAndRoles.find(
                  (tenantAndRole) =>
                    tenantAndRole.tenant.id === selectedTenant.id
                );
                if (!userRoles) {
                  return false;
                }
                return permission === userRoles.role;
              }) === undefined
            ) {
              return <></>;
            }
            return (
              <div
                key={group.groupName + 'headerItem'}
                className="space-y-1.5 mb-7"
              >
                <h4 className="font-medium text-xl">{group.groupName}</h4>
                {group.items.map((item) => {
                  // Check for permissions:
                  const itemPermissions = item.permissions;
                  const itemTenantPermissions = item.tenantPermissions;

                  // Check permissions at the app level:
                  if (itemPermissions.length !== 0 && !session) {
                    return <></>;
                  } else if (
                    itemPermissions.length !== 0 &&
                    session &&
                    itemPermissions.find(
                      (permission) => permission === session.user.role
                    ) === undefined
                  ) {
                    return <></>;
                  }

                  // Check permissions at the tenant level:
                  if (itemTenantPermissions.length !== 0 && !selectedTenant) {
                    return <></>;
                  } else if (
                    itemTenantPermissions.length !== 0 &&
                    selectedTenant &&
                    itemTenantPermissions.find((permission) => {
                      const userRoles = tenantsAndRoles.find(
                        (tenantAndRole) =>
                          tenantAndRole.tenant.id === selectedTenant.id
                      );
                      if (!userRoles) {
                        return false;
                      }
                      return permission === userRoles.role;
                    }) === undefined
                  ) {
                    return <></>;
                  }
                  return (
                    <Link
                      href={
                        item.href +
                        (selectedTenant ? `?tenantId=${selectedTenant.id}` : '')
                      }
                      key={group.groupName + item.title + 'subItem'}
                      className="flex flex-row gap-3 items-center justify-between cursor-pointer text-muted-foreground"
                      onClick={() => {
                        setIsNavMenuOpen(false);
                      }}
                    >
                      <h6 className="text-base">{item.title}</h6>
                      <ArrowRightIcon />
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </ScrollArea>

        {footerItems && (
          <div>
            <Separator />

            <div className="flex flex-row gap-3 mt-3">{footerItems}</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
