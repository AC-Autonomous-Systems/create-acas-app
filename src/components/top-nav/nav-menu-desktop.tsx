'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import ListItem from './list-item';
import { NavigationMenuItemDef } from './types';
import { useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import { TenantContext } from '@/app/tenant-provider';
import { TenantsAndRole } from '@/app/api/tenant/types';
import { Session } from 'next-auth';

type DesktopNavigationMenuProps = {
  navigationMenuItems: NavigationMenuItemDef[];
  tenantsAndRoles: TenantsAndRole[];
  session: Session | null;
};

export default function DesktopNavigationMenu({
  navigationMenuItems,
  tenantsAndRoles,
  session,
}: DesktopNavigationMenuProps) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { selectedTenant } = useContext(TenantContext);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <NavigationMenu
      className="hidden md:block pl-32"
      delayDuration={0}
    >
      <NavigationMenuList>
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
                (tenantAndRole) => tenantAndRole.tenant.id === selectedTenant.id
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
            <NavigationMenuItem key={group.groupName + 'navItem'}>
              <NavigationMenuTrigger>{group.groupName}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[450px] gap-3 p-4 md:grid-cols-2 lg:w-[600px] ">
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
                      <ListItem
                        href={
                          item.href +
                          (selectedTenant
                            ? `?tenantId=${selectedTenant.id}`
                            : '')
                        }
                        title={item.title}
                        key={item.title + 'navInnerItem'}
                      >
                        {item.description}
                      </ListItem>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
