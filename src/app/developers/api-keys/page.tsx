import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { authOptions } from '@/lib/auth/next-auth';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { APIKey } from '../../api/api-keys/types';
import getDataFromApi from '@/lib/util/rsc-data-fetch';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { sleep } from '@/lib/util/sleep';
import APIKeysTable from '@/components/developers/api-keys/api-keys-table';
import CreateKey from '@/components/developers/api-keys/create-key';

export default async function APIKeys({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) {
  /* ------------------------------- AUTH check: ------------------------------ */
  // Check if there is a session:
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }

  /* -------------------------------------------------------------------------- */
  /*                              RSC Data Fetching                             */
  /* -------------------------------------------------------------------------- */

  const searchParamsParsed = new URLSearchParams(searchParams);
  let tenantId = searchParamsParsed.get('tenantId');
  // 1. If there isn't a selected tenant, prompt the user to select a tenant:
  if (!tenantId || tenantId === 'undefined') {
    throw new Error(
      'Tenant ID not found, make sure you have a tenant selected (can be done in the top right on Desktop and in the hamburger menu on Mobile devices) and the tenant ID is in the URL'
    );
  }
  // get the current url:
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const url = `${protocol}://${host}`;

  // 2. If there is a selected tenant, fetch the API keys for that tenant:
  let apiKeys: APIKey[] = [];

  const response = await getDataFromApi(
    `${url}/api/api-keys/tenant/${tenantId}`,
    {
      method: 'GET',
    }
  );

  const data = await response.json();

  if (data && data.apiKeys) {
    apiKeys = data.apiKeys;
  } else if (data && data.error) {
    throw new Error(data.error);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="w-full h-full flex flex-col mt-3">
      {/* API Keys */}

      <Card className="h-full">
        <CardHeader className="w-full flex flex-row justify-between">
          <p className="font-semibold md:text-2xl">API Keys</p>
          <CreateKey />
        </CardHeader>
        <CardContent>
          <APIKeysTable apiKeys={apiKeys} />
        </CardContent>
      </Card>
    </div>
  );
}
