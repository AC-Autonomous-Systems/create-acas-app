import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { db } from '../db/db';
import { usersTable } from '@/app/api/users/schema';
import { eq } from 'drizzle-orm';
import { User } from '@/app/api/users/types';
import { Tenant, TenantsAndRole } from '@/app/api/tenant/types';
import { tenantUsersTable, tenantsTable } from '@/app/api/tenant/schema';

/**
 * Retrieves the user from the request object.
 * @param request - The NextRequest object representing the incoming request.
 * @returns A Promise that resolves to the User object if the user is found, or null otherwise.
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ user: User; tenantsAndRole: TenantsAndRole[] } | null> {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!session || !session.email) {
    return null;
  }

  const userFromEmail = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, session.email));

  if (!userFromEmail || userFromEmail.length === 0 || !userFromEmail[0]) {
    return null;
  }

  // Fetch all the tenants/roles associated with this user:
  const tenantsAndRoleRes = await db
    .select()
    .from(tenantUsersTable)
    .leftJoin(tenantsTable, eq(tenantUsersTable.tenantId, tenantsTable.id))
    .where(eq(tenantUsersTable.userId, userFromEmail[0].id))
    .orderBy(tenantsTable.id);

  return {
    user: userFromEmail[0] as User,
    tenantsAndRole: tenantsAndRoleRes.map((res) => {
      return {
        tenant: res.tenants as Tenant,
        role: res.tenant_users.role,
      };
    }),
  };
}

/**
 * Checks if a role is present in the allowed roles.
 * @param role - The role to check.
 * @param roles - An array of allowed roles.
 * @returns A boolean indicating whether the role is in the allowed roles.
 */
export function isRoleInAllowedRoles(role: string, roles: string[]): boolean {
  return roles.includes(role);
}
