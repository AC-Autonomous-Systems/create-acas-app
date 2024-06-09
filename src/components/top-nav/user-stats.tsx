'use client';
import { useState } from 'react';
import { MoonIcon, PersonIcon, SunIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UserStats() {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const { data: sessionData } = useSession();
  const nextRouter = useRouter();

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={!sessionData ? 'outline' : 'ghost'}
          size="icon"
          className="cursor-pointer z-30"
        >
          {sessionData && sessionData.user && sessionData.user.image ? (
            <img
              src={sessionData?.user.image}
              className="w-6 h-6"
            />
          ) : (
            <PersonIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sessionData && sessionData.user ? (
          <>
            <DropdownMenuItem>{sessionData.user.email}</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.localStorage.removeItem('tenant');
                const url = new URL(window.location.href);
                url.searchParams.delete('tenantId');
                // Replace the URL with the new one:
                window.history.replaceState({}, '', url.toString());

                signOut();
              }}
            >
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              signIn();
            }}
          >
            Sign In
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
