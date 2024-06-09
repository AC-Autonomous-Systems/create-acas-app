import { NextRequest, NextResponse } from 'next/server';
import { zCreateAPIKeyInput, zDeleteAPIKeyInput } from './types';
import { apiKeysTable } from './schema';
import { db } from '@/lib/db/db';
import { getUserFromRequest, isRoleInAllowedRoles } from '@/lib/auth/rbac';
import { generateRandomString } from '@/lib/util/random';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  /* ---------------------------------- RBAC ---------------------------------- */
  const userFromRequest = await getUserFromRequest(request);

  if (!userFromRequest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allowedRoles = ['admin'];

  /* -------------------------------------------------------------------------- */
  /*                              Input Validation                              */
  /* -------------------------------------------------------------------------- */
  const inputBody = zCreateAPIKeyInput.safeParse(await request.json());

  if (!inputBody.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: inputBody.error.errors,
      },
      { status: 400 }
    );
  }

  const { name, expiration, tenantId } = inputBody.data;

  // Make sure the user belongs in the organization and has one of the allowed roles:
  const tenantFromUserTenantsAndRole = userFromRequest.tenantsAndRole.find(
    (tenantAndRoleEntry) => tenantAndRoleEntry.tenant.id === tenantId
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

  const createAPIKeyRes = await db
    .insert(apiKeysTable)
    .values({
      name: name,
      key: generateRandomString(1024), // !The odds of this repeating are astronomically low.
      createdAt: new Date(),
      tenantId: tenantId,
      ...(expiration && { expiration: new Date(expiration) }),
    })
    .returning();

  if (!createAPIKeyRes || createAPIKeyRes.length === 0 || !createAPIKeyRes[0]) {
    return NextResponse.json(
      {
        error: 'Failed to create API key',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { createdAPIKey: createAPIKeyRes[0] },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  /* ---------------------------------- RBAC ---------------------------------- */
  const userFromRequest = await getUserFromRequest(request);

  if (!userFromRequest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allowedRoles = ['admin'];

  /* -------------------------------------------------------------------------- */
  /*                              Input Validation                              */
  /* -------------------------------------------------------------------------- */
  const inputBody = zDeleteAPIKeyInput.safeParse(await request.json());

  if (!inputBody.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: inputBody.error.errors,
      },
      { status: 400 }
    );
  }

  const { id } = inputBody.data;

  // Fetch the API key:
  const apiKeyFromDb = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.id, id));

  if (!apiKeyFromDb || apiKeyFromDb.length === 0) {
    return NextResponse.json(
      {
        error: 'API key not found',
      },
      { status: 404 }
    );
  }

  // Make sure the user belongs in the organization and has one of the allowed roles:
  const tenantFromUserTenantsAndRole = userFromRequest.tenantsAndRole.find(
    (tenantAndRoleEntry) =>
      tenantAndRoleEntry.tenant.id === apiKeyFromDb[0].tenantId
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

  // Delete the API key:
  await db.delete(apiKeysTable).where(eq(apiKeysTable.id, id));

  return NextResponse.json({ deletedAPIKey: apiKeyFromDb[0] }, { status: 200 });
}
