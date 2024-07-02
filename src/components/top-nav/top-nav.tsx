import { Separator } from '../ui/separator';
import UserStats from './user-stats';
import Link from 'next/link';
import ThemeToggle from '../ui/theme-toggle';
import DesktopNavigationMenu from './nav-menu-desktop';
import { NavigationMenuItemDef } from './types';
import HamburgerNav from './hamburger-nav';
import QRCode from '../icons/qr-code';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth';
import SelectTenant from './select-tenant';
import getDataFromApi from '@/lib/util/rsc-data-fetch';
import { Tenant, TenantsAndRole } from '@/app/api/tenant/types';
import { headers } from 'next/headers';

const HOMEPAGE_NAVIGATION_MENU_ITEMS: NavigationMenuItemDef[] = [
  {
    groupName: 'Products',
    permissions: [],
    tenantPermissions: [],
    items: [
      {
        title: 'Genmega Kiosk API',
        description: 'API to dispense cash from Genmega machines.',
        href: '/genmega-kiosk-api',
        permissions: [],
        tenantPermissions: [],
      },
    ],
  },
];

const AUTHENTICATED_NAVIGATION_MENU_ITEMS: NavigationMenuItemDef[] = [
  {
    groupName: 'Documentation',
    permissions: [],
    tenantPermissions: [],
    items: [
      {
        title: 'API Reference',
        description: 'API reference documentation',
        href: '/api-reference',
        permissions: [],
        tenantPermissions: [],
      },
      {
        title: 'Examples',
        description: 'Examples of API Usage',
        href: '/api-examples',
        permissions: [],
        tenantPermissions: [],
      },
      {
        title: 'Supported Machines',
        description: 'List of supported machines',
        href: '/supported-machines',
        permissions: [],
        tenantPermissions: [],
      },
    ],
  },
  {
    groupName: 'Developers',
    permissions: [],
    tenantPermissions: ['user', 'admin'],
    items: [
      {
        title: 'API Keys',
        description: 'Manage your API keys.',
        href: '/developers/api-keys',
        permissions: [],
        tenantPermissions: ['admin'],
      },
      {
        title: 'Machines',
        description: 'Manage your machines.',
        href: '/machines',
        permissions: [],
        tenantPermissions: ['user', 'admin'],
      },
    ],
  },
];

export default async function TopNav() {
  /* -------------------------------------------------------------------------- */
  /*                                    Auth                                    */
  /* -------------------------------------------------------------------------- */
  const session = await getServerSession(authOptions);

  /* -------------------------------------------------------------------------- */
  /*                              RSC Data Fetching                             */
  /* -------------------------------------------------------------------------- */
  // get the current url:
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';

  let tenants: Tenant[] = [];
  let tenantsAndRoles: TenantsAndRole[] = [];

  if (session && session.user) {
    const response = await getDataFromApi(`${protocol}://${host}/api/tenant`, {
      method: 'GET',
    });

    const data = await response.json();

    if (data && data.tenants && data.tenantsAndRoles) {
      tenants = data.tenants;
      tenantsAndRoles = data.tenantsAndRoles;
    } else if (data && data.error) {
      throw new Error(data.error);
    }
  }
  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="w-full flex flex-col">
      {/* Nav Items */}
      <div className="w-full flex flex-row justify-between items-center h-14 px-3">
        <div>
          <Link
            href="/"
            className="flex flex-row justify-center"
          >
            <QRCode className="w-8 h-8" />
            <p className="text-2xl">ACAS</p>
          </Link>
        </div>
        <DesktopNavigationMenu
          navigationMenuItems={
            session
              ? AUTHENTICATED_NAVIGATION_MENU_ITEMS
              : HOMEPAGE_NAVIGATION_MENU_ITEMS
          }
          tenantsAndRoles={tenantsAndRoles}
          session={session}
        />
        {/* Light/Dark mode toggle + user icon + hamburger bar on mobile */}
        <div className="flex flex-row items-center gap-3">
          {/* Toggles/User stats: */}
          {session && session.user && (
            <div className="hidden md:flex">
              <SelectTenant tenants={tenants} />
            </div>
          )}
          <ThemeToggle />
          <UserStats />
          {/* Mobile ONLY: HambergurIcon */}
          <HamburgerNav
            navigationMenuItems={
              session
                ? AUTHENTICATED_NAVIGATION_MENU_ITEMS
                : HOMEPAGE_NAVIGATION_MENU_ITEMS
            }
            footerItems={
              <>
                <SelectTenant tenants={tenants} />
              </>
            }
            session={session}
            tenantsAndRoles={tenantsAndRoles}
          />
        </div>
      </div>

      {/* Separate header from everything else: */}
      <Separator />
    </div>
  );
}
