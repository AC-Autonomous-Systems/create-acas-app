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

type DesktopNavigationMenuProps = {
  navigationMenuItems: NavigationMenuItemDef[];
};

export default function DesktopNavigationMenu({
  navigationMenuItems,
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
          return (
            <NavigationMenuItem key={group.groupName + 'navItem'}>
              <NavigationMenuTrigger>{group.groupName}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[450px] gap-3 p-4 md:grid-cols-2 lg:w-[600px] ">
                  {group.items.map((item) => {
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
