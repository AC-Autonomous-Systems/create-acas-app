import { client, db } from '@/lib/db/db';
import { getUserFromRequest } from '@/lib/auth/rbac';
import { NextRequest } from 'next/server';
import { GET, POST, PUT } from './route';
import { tenantUsersTable, tenantsTable } from './schema';
import { eq } from 'drizzle-orm';
import { getToken } from 'next-auth/jwt';

jest.mock('@/lib/auth/rbac', () => ({
  getUserFromRequest: jest.fn(),
  isRoleInAllowedRoles:
    jest.requireActual('@/lib/auth/rbac').isRoleInAllowedRoles,
}));
const mockGetUserFromRequest = getUserFromRequest as jest.Mock;

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

const mockGetToken = getToken as jest.Mock;

describe('tenant tests', () => {
  test('tenant creation', async () => {
    // Mock getToken function in getUserFromRequest using jest:

    const mockUser = {
      user: {
        id: '88915fe4-b4ff-4402-a29c-8abedf6a3cff',
        email: 'mark@example.com',
      },
      tenantsAndRole: [],
    };
    mockGetUserFromRequest.mockResolvedValueOnce(mockUser);

    const testRequest = new NextRequest('http://localhost:3001/api/tenant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Tenant 123',
      }),
    });

    const response = await POST(testRequest);
    expect(response.status).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.createdTenant).toBeDefined();
    expect(responseBody.createdTenant.name).toBe('Test Tenant 123');
    expect(responseBody.createdTenant.id).toBeDefined();
    expect(responseBody.createdTenant.createdAt).toBeDefined();
    expect(responseBody.createdTenant.owner).toBe(
      '88915fe4-b4ff-4402-a29c-8abedf6a3cff'
    );
  });

  test('tenant update', async () => {
    const tenantFromDb = await db
      .select({
        id: tenantsTable.id,
        name: tenantsTable.name,
        owner: tenantsTable.owner,
        user: tenantUsersTable.userId,
      })
      .from(tenantsTable)
      .leftJoin(
        tenantUsersTable,
        eq(tenantUsersTable.tenantId, tenantsTable.id)
      )
      .where(eq(tenantsTable.name, 'Test Tenant 123'))
      .limit(1);

    expect(tenantFromDb).toHaveLength(1);

    const mockUser = {
      user: {
        id: '88915fe4-b4ff-4402-a29c-8abedf6a3cff',
        email: 'mark@example.com',
      },
      tenantsAndRole: [
        {
          tenant: tenantFromDb[0],
          role: 'admin',
        },
      ],
    };
    mockGetUserFromRequest.mockResolvedValueOnce(mockUser);

    const testRequest = new NextRequest(
      `http://localhost:3001/api/tenant/${tenantFromDb[0].id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Test Tenant 123',
        }),
      }
    );

    const response = await PUT(testRequest, {
      params: { id: tenantFromDb[0].id },
    });

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(responseBody.updatedTenant).toBeDefined();
    expect(responseBody.updatedTenant.name).toBe('Updated Test Tenant 123');
    expect(responseBody.updatedTenant.id).toBe(tenantFromDb[0].id);
    expect(responseBody.updatedTenant.createdAt).toBeDefined();
    expect(responseBody.updatedTenant.owner).toBe(
      '88915fe4-b4ff-4402-a29c-8abedf6a3cff'
    );

    // ❌ Authorized user should not be able to update the tenant
    const mockUnauthorizedUser = {
      user: {
        email: 'user2@example.com',
        id: 'ee215fe4-b4ff-4402-a29c-8abedf6a3cff',
      },
      tenantsAndRole: [],
    };
    mockGetUserFromRequest.mockResolvedValueOnce(mockUnauthorizedUser);

    const testRequestUnauthorized = new NextRequest(
      `http://localhost:3001/api/tenant/${tenantFromDb[0].id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Test Tenant 123',
        }),
      }
    );

    const responseUnauthorized = await PUT(testRequestUnauthorized, {
      params: { id: tenantFromDb[0].id },
    });

    expect(responseUnauthorized.status).toBe(401);
  });

  test('tenant - get own tenants', async () => {
    // This makes it s.t. the original implementation is used:
    const originalGetUserFromRequest =
      jest.requireActual('@/lib/auth/rbac').getUserFromRequest;
    mockGetUserFromRequest.mockImplementationOnce((...args) =>
      originalGetUserFromRequest(...args)
    );
    const markTenantsFromDB = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.owner, '88915fe4-b4ff-4402-a29c-8abedf6a3cff'))
      .orderBy(tenantsTable.id);

    const mockSession = {
      email: 'mark@example.com',
    };

    mockGetToken.mockResolvedValueOnce(mockSession);

    const testRequest = new NextRequest('http://localhost:3001/api/tenant', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await GET(testRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.tenants).toHaveLength(markTenantsFromDB.length);
    for (let i = 0; i < markTenantsFromDB.length; i++) {
      expect(responseBody.tenants[i].id).toBe(markTenantsFromDB[i].id);
      expect(responseBody.tenants[i].name).toBe(markTenantsFromDB[i].name);
      expect(responseBody.tenants[i].owner).toBe(markTenantsFromDB[i].owner);
    }
  });
});

afterAll(async () => {
  await client.end();
});
