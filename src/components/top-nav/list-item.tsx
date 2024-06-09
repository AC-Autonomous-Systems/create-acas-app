'use client';

import Link from 'next/link';
import { NavigationMenuLink } from '../ui/navigation-menu';
import { cn } from '@/lib/ui/utils';
import React from 'react';

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    props.href && (
      <li>
        <Link href={props.href}>
          <NavigationMenuLink asChild>
            <div
              className={cn(
                'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                className
              )}
            >
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}  
              </p>
            </div>
          </NavigationMenuLink>
        </Link>
      </li>
    )
  );
});
ListItem.displayName = 'ListItem';

export default ListItem;
