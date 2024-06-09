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

type HamburgerNavProps = {
  navigationMenuItems: NavigationMenuItemDef[];
  footerItems?: React.ReactNode;
};

export default function HamburgerNav({
  navigationMenuItems,
  footerItems,
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
            return (
              <div
                key={group.groupName + 'headerItem'}
                className="space-y-1.5 mb-7"
              >
                <h4 className="font-medium text-xl">{group.groupName}</h4>
                {group.items.map((item) => {
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
