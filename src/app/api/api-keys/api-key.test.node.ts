import { client, db } from '@/lib/db/db';
import { getUserFromRequest } from '@/lib/auth/rbac';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { tenantUsersTable, tenantsTable } from '../tenant/schema';
import { DELETE, POST } from './route';
import { addDays } from 'date-fns';
import { apiKeysTable } from './schema';
import { GET } from './tenant/[id]/route';

jest.mock('@/lib/auth/rbac', () => ({
  getUserFromRequest: jest.fn(),
  isRoleInAllowedRoles:
    jest.requireActual('@/lib/auth/rbac').isRoleInAllowedRoles,
}));
const mockGetUserFromRequest = getUserFromRequest as jest.Mock;

describe('api-key tests', () => {
  test('api-key creation', async () => {
    const tenantFromDb = await db
      .select({
        id: tenantsTable.id,
        name: tenantsTable.name,
        CDUKey: tenantsTable.CDUKey,
        owner: tenantsTable.owner,
        user: tenantUsersTable.userId,
      })
      .from(tenantsTable)
      .leftJoin(
        tenantUsersTable,
        eq(tenantUsersTable.tenantId, tenantsTable.id)
      )
      .limit(1)
      .where(eq(tenantsTable.name, 'Mark Test Tenant'));

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
    const expirationDate = addDays(new Date(), 10);

    const testRequest = new NextRequest('http://localhost:3001/api/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test API Key 123',
        expiration: expirationDate,
        tenantId: tenantFromDb[0].id,
      }),
    });

    const response = await POST(testRequest);
    expect(response.status).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.createdAPIKey).toBeDefined();
    expect(responseBody.createdAPIKey.name).toBe('Test API Key 123');
    expect(responseBody.createdAPIKey.expiration).toBe(
      expirationDate.toISOString() // Over the network the result is an ISO string.
    );
    expect(responseBody.createdAPIKey.tenantId).toBe(tenantFromDb[0].id);
    expect(responseBody.createdAPIKey.key).toHaveLength(1024);
  });

  test('api-key delete', async () => {
    // 1. Fetch tenant:
    const tenantFromDb = await db
      .select({
        id: tenantsTable.id,
        name: tenantsTable.name,
        CDUKey: tenantsTable.CDUKey,
        owner: tenantsTable.owner,
        user: tenantUsersTable.userId,
      })
      .from(tenantsTable)
      .leftJoin(
        tenantUsersTable,
        eq(tenantUsersTable.tenantId, tenantsTable.id)
      )
      .limit(1)
      .where(eq(tenantsTable.name, 'Mark Test Tenant'));

    expect(tenantFromDb).toHaveLength(1);

    // 2. Fetch API key:
    const apiKeyFromDb = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.name, 'Mark Tenant API Key To Delete'));
    expect(apiKeyFromDb).toHaveLength(1);

    // ❌ Unuthorized user should not be able to delete the API key
    const mockUnauthorizedUser = {
      user: {
        email: 'user2@example.com',
        id: 'ee215fe4-b4ff-4402-a29c-8abedf6a3cff',
      },
      tenantsAndRole: [],
    };
    mockGetUserFromRequest.mockResolvedValueOnce(mockUnauthorizedUser);

    const testRequestUnauthorized = new NextRequest(
      `http://localhost:3001/api/api-keys/${apiKeyFromDb[0].id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: apiKeyFromDb[0].id,
        }),
      }
    );

    const responseUnauthorized = await DELETE(testRequestUnauthorized);
    expect(responseUnauthorized.status).toBe(401);

    // ✅ Authorized user should be able to delete the API key
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
      `http://localhost:3001/api/api-keys/${apiKeyFromDb[0].id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: apiKeyFromDb[0].id,
        }),
      }
    );

    const response = await DELETE(testRequest);
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.deletedAPIKey).toBeDefined();
    expect(responseBody.deletedAPIKey.name).toBe(
      'Mark Tenant API Key To Delete'
    );

    // ✅ API key should be deleted
    const apiKeyFromDbAfterDelete = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.id, apiKeyFromDb[0].id));
    expect(apiKeyFromDbAfterDelete).toHaveLength(0);
  });

  test('ap-keys get by tenant', async () => {
    const tenantFromDb = await db
      .select({
        id: tenantsTable.id,
        name: tenantsTable.name,
        CDUKey: tenantsTable.CDUKey,
        owner: tenantsTable.owner,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.name, 'Mark Test Tenant'))
      .limit(1);
    expect(tenantFromDb).toHaveLength(1);

    const apiKeysFromTenant = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.tenantId, tenantFromDb[0].id))
      .orderBy(apiKeysTable.createdAt);

    // ❌ Unuthorized user should not be able to get the API keys for a tenant that they are not a member of:
    const unauthorizedMockUser = {
      user: {
        id: 'ee215fe4-b4ff-4402-a29c-8abedf6a3cff',
        email: 'user2@example.com',
      },
      tenantsAndRole: [],
    };
    mockGetUserFromRequest.mockResolvedValueOnce(unauthorizedMockUser);
    const testRequestUnauthorized = new NextRequest(
      `http://localhost:3001/api/api-keys/tenant/${tenantFromDb[0].id}`,
      {
        method: 'GET',
      }
    );
    const responseUnauthorized = await GET(testRequestUnauthorized, {
      params: { id: tenantFromDb[0].id },
    });
    expect(responseUnauthorized.status).toBe(401);

    // ✅ Should be able to get the API keys for a tenant that they are a member of:
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
      `http://localhost:3001/api/api-keys/tenant/${tenantFromDb[0].id}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(testRequest, {
      params: { id: tenantFromDb[0].id },
    });
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.apiKeys).toHaveLength(apiKeysFromTenant.length);
    for (let i = 0; i < apiKeysFromTenant.length; i++) {
      expect(responseBody.apiKeys[i].id).toBe(apiKeysFromTenant[i].id);
      expect(responseBody.apiKeys[i].key).toBe(apiKeysFromTenant[i].key);
      expect(responseBody.apiKeys[i].name).toBe(apiKeysFromTenant[i].name);
      expect(new Date(responseBody.apiKeys[i].createdAt).toISOString()).toBe(
        new Date(apiKeysFromTenant[i].createdAt).toISOString()
      );
      expect(
        responseBody.apiKeys[i].expiration !== null
          ? new Date(responseBody.apiKeys[i].expiration).toISOString()
          : null
      ).toBe(
        apiKeysFromTenant[i].expiration !== null
          ? new Date(apiKeysFromTenant[i].expiration!).toISOString()
          : null
      );
      expect(responseBody.apiKeys[i].tenantId).toBe(
        apiKeysFromTenant[i].tenantId
      );
    }
  });
});

afterAll(async () => {
  await client.end();
});
