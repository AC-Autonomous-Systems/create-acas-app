import { getUserFromRequest, isRoleInAllowedRoles } from '@/lib/auth/rbac';
import { db } from '@/lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiKeysTable } from '../../schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  /* ---------------------------------- RBAC ---------------------------------- */
  const userFromRequest = await getUserFromRequest(request);

  if (!userFromRequest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allowedRoles = ['admin'];

  /* -------------------------------------------------------------------------- */
  /*                              Input Validation                              */
  /* -------------------------------------------------------------------------- */
  if (!params.id) {
    return NextResponse.json(
      {
        error: 'You must provide a tenant id',
      },
      { status: 400 }
    );
  }

  const tenantId = params.id;
  const userTenantRole = userFromRequest.tenantsAndRole.find(
    (tenantAndRole) => {
      return tenantAndRole.tenant.id === tenantId;
    }
  );

  if (!userTenantRole) {
    return NextResponse.json(
      {
        error: 'You must be a member of the organization to access this route',
      },
      { status: 401 }
    );
  } else if (!isRoleInAllowedRoles(userTenantRole.role, allowedRoles)) {
    return NextResponse.json(
      {
        error: 'You must be an admin to access this route',
      },
      { status: 401 }
    );
  }

  const apiKeysFromDbRes = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.tenantId, tenantId))
    .orderBy(apiKeysTable.createdAt);

  return NextResponse.json({
    apiKeys: apiKeysFromDbRes,
  });
}
