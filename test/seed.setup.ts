import { apiKeysTable } from '@/app/api/api-keys/schema';

// import { machinesTable } from '@/app/api/machine/schema';
import { tenantUsersTable, tenantsTable } from '@/app/api/tenant/schema';
import { usersTable } from '@/app/api/users/schema';
import { db } from '@/lib/db/db';
import { generateRandomString } from '@/lib/util/random';
import { addDays } from 'date-fns';
import { sql } from 'drizzle-orm';

export default async function execute() {
  let totalNumberOfSteps = 2;
  let currentStep = 1;
  // Clear all the data from the database
  console.log(
    `🚧 [${currentStep}/${totalNumberOfSteps}] Clearing all the data from the database...`
  );

  const query = sql<string>`SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
  `;

  const tables = await db.execute(query); // retrieve tables

  for (let table of tables) {
    const query = sql.raw(`DELETE FROM ${table.table_name} CASCADE;`);
    await db.execute(query); // Truncate (clear all the data) the table
  }

  currentStep += 1;
  console.log(
    `🌾 [${currentStep}/${totalNumberOfSteps}] Seeding the databse with test data...`
  );
  // Create the users:
  await db.insert(usersTable).values([
    {
      name: 'Mark Chang',
      email: 'mark@example.com',
      id: '88915fe4-b4ff-4402-a29c-8abedf6a3cff',
    },
    {
      name: 'User 2',
      email: 'user2@example.com',
      id: 'ee215fe4-b4ff-4402-a29c-8abedf6a3cff',
    },
  ]);

  // Create the tenants:
  await db.insert(tenantsTable).values([
    {
      name: 'Mark Test Tenant',

      owner: '88915fe4-b4ff-4402-a29c-8abedf6a3cff',
      id: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
    },
    {
      name: 'User 2 Test Tenant',

      owner: 'ee215fe4-b4ff-4402-a29c-8abedf6a3cff',
      id: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
    },
  ]);

  // Create the users in the tenants:
  await db.insert(tenantUsersTable).values([
    {
      userId: '88915fe4-b4ff-4402-a29c-8abedf6a3cff',
      tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
      role: 'admin',
    },
    {
      userId: 'ee215fe4-b4ff-4402-a29c-8abedf6a3cff',
      tenantId: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
      role: 'admin',
    },
  ]);

  // Create an API key for update and for dispsense tests:
  await db.insert(apiKeysTable).values([
    {
      name: 'Mark Tenant API Key To Delete',
      key: generateRandomString(1024),
      createdAt: new Date(),
      expiration: addDays(new Date(), 10),
      tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
    },
    {
      name: 'Mark Tenant API Key To Dispense',
      key: generateRandomString(1024),
      createdAt: new Date(),
      expiration: addDays(new Date(), 10),
      tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
    },
    {
      name: 'User 2 Tenant API Key To Dispense',
      key: generateRandomString(1024),
      createdAt: new Date(),
      expiration: addDays(new Date(), 10),
      tenantId: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
    },
  ]);

  // Create the machines for dispense tests:
  // await db.insert(machinesTable).values([
  //   {
  //     name: 'Mark Test Machine 123',
  //     tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
  //     id: '3ef433dd-2ddc-4d5a-a453-4d9d2ed442c9',
  //   },
  //   {
  //     name: 'User 2 Test Machine',
  //     tenantId: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
  //     id: '8a58fa2b-fd5b-4283-a939-c8433a012869',
  //   },
  // ]);

  process.exit(0);
}

execute();
