import { NextRequest, NextResponse } from 'next/server';
import { Tenant, zCreateTenantInput, zUpdateTenantInput } from './types';
import { db } from '@/lib/db/db';
import { tenantUsersTable, tenantsTable } from './schema';
import { getUserFromRequest, isRoleInAllowedRoles } from '@/lib/auth/rbac';
import { ZodIssue } from 'zod';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest
): Promise<
  NextResponse<
    | { createdTenant: Tenant }
    | { error: string }
    | { error: string; details: ZodIssue[] }
  >
> {
  /* ---------------------------------- RBAC ---------------------------------- */
  const userFromRequest = await getUserFromRequest(request);

  if (!userFromRequest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  // !No need to validate roles since all users should be able to create an organization.

  /* -------------------------------------------------------------------------- */
  /*                              Input Validation                              */
  /* -------------------------------------------------------------------------- */

  const inputBody = zCreateTenantInput.safeParse(await request.json());

  if (!inputBody.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: inputBody.error.errors,
      },
      { status: 400 }
    );
  }

  const { name } = inputBody.data;

  /* ----------- Create the tenant and add the user into tenantUsers ---------- */

  try {
    const createTenantRes = await db.transaction(async (tx) => {
      const tenantCreationRes = await tx
        .insert(tenantsTable)
        .values({
          name: name,
          owner: userFromRequest.user.id,
        })
        .returning();
      if (
        !tenantCreationRes ||
        tenantCreationRes.length === 0 ||
        !tenantCreationRes[0]
      ) {
        throw new Error('Failed to create tenant!');
      }

      const tenantUserCreationRes = await tx
        .insert(tenantUsersTable)
        .values({
          tenantId: tenantCreationRes[0].id,
          userId: userFromRequest.user.id,
          role: 'admin',
        })
        .returning();

      if (!tenantUserCreationRes || tenantUserCreationRes.length === 0) {
        throw new Error('Failed to create tenant user!');
      }

      return tenantCreationRes[0];
    });

    return NextResponse.json(
      {
        createdTenant: createTenantRes as Tenant,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create tenant: ' + error.message,
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          error: 'Failed to create tenant: Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<
  NextResponse<
    | { updatedTenant: Tenant }
    | { error: string }
    | { error: string; details: ZodIssue[] }
  >
> {
  /* ---------------------------------- RBAC ---------------------------------- */
  const userFromRequest = await getUserFromRequest(request);

  if (!userFromRequest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allowedRoles = ['admin'];

  /* -------------------------------------------------------------------------- */
  /*                              Input Validation                              */
  /* -------------------------------------------------------------------------- */

  const inputBody = zUpdateTenantInput.safeParse(await request.json());

  if (!inputBody.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: inputBody.error.errors,
      },
      { status: 400 }
    );
  }

  const { name } = inputBody.data;

  const tenantFromId = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.id, params.id));

  if (!tenantFromId || tenantFromId.length === 0) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Make sure the user belongs in the organization and has one of the allowed roles:
  const tenantFromUserTenantsAndRole = userFromRequest.tenantsAndRole.find(
    (tenantAndRoleEntry) => tenantAndRoleEntry.tenant.id === params.id
  );

  if (!tenantFromUserTenantsAndRole) {
    return NextResponse.json(
      { error: 'User does not belong in the organization' },
      { status: 401 }
    );
  } else if (
    !isRoleInAllowedRoles(tenantFromUserTenantsAndRole.role, allowedRoles)
  ) {
    return NextResponse.json(
      {
        error: 'User does not have permission to update organization settings',
      },
      { status: 401 }
    );
  }

  /* ---------------------------- Update the tenant --------------------------- */
  if (Object.keys(inputBody.data).length > 0) {
    const updatedTenantRes = await db
      .update(tenantsTable)
      .set({
        ...(name && { name: name }),
      })
      .where(eq(tenantsTable.id, params.id))
      .returning();

    if (!updatedTenantRes || updatedTenantRes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update tenant' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { updatedTenant: updatedTenantRes[0] },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { updatedTenant: tenantFromId[0] },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  /* ---------------------------------- RBAC ---------------------------------- */
  const userFromRequest = await getUserFromRequest(request);

  if (!userFromRequest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  return NextResponse.json({
    tenants: userFromRequest.tenantsAndRole.map(
      (tenantAndRole) => tenantAndRole.tenant
    ),
  });
}
