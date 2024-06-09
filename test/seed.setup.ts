import { apiKeysTable } from '@/app/api/api-keys/schema';
import {
  dispenseJobBreakdownTable,
  dispenseJobsTable,
} from '@/app/api/dispense-job/schema';
import { machinesTable } from '@/app/api/machine/schema';
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
      CDUKey: 'CDU123Key',
      owner: '88915fe4-b4ff-4402-a29c-8abedf6a3cff',
      id: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
    },
    {
      name: 'User 2 Test Tenant',
      CDUKey: 'CDU123Key2',
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
  await db.insert(machinesTable).values([
    {
      name: 'Mark Test Machine 123',
      tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
      id: '3ef433dd-2ddc-4d5a-a453-4d9d2ed442c9',
    },
    {
      name: 'User 2 Test Machine',
      tenantId: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
      id: '8a58fa2b-fd5b-4283-a939-c8433a012869',
    },
  ]);

  // Dispense job to update:
  await db.insert(dispenseJobsTable).values([
    // For Mark Test Tenant:
    {
      dispenseAmount: 10,
      machineId: '3ef433dd-2ddc-4d5a-a453-4d9d2ed442c9',
      status: 'pending',
      createdAt: new Date(),
      tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
      id: '4d7f9096-810e-427c-9641-9aa77acf3d9b',
    },
    // For updating the dispense amount of a dispense job:
    {
      dispenseAmount: 20,
      dispensedAmount: 20,
      machineId: '3ef433dd-2ddc-4d5a-a453-4d9d2ed442c9',
      status: 'dispensed',
      createdAt: new Date(),
      tenantId: 'ce65e44c-5db3-4a3c-8b81-2007a234c322',
      id: '53240772-fd8d-41d0-b33b-2eb89e4d04cf',
    },
    // For User 2 Test Tenant:
    {
      dispenseAmount: 10,
      machineId: '8a58fa2b-fd5b-4283-a939-c8433a012869',
      status: 'pending',
      createdAt: new Date(),
      tenantId: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
      id: '914791a0-8aae-4001-8ef7-aed4ba43f4f6',
    },

    {
      dispenseAmount: 3,
      machineId: '8a58fa2b-fd5b-4283-a939-c8433a012869',
      status: 'pending',
      createdAt: new Date(),
      tenantId: 'b5b80051-8494-4f89-9053-a9ec9978f42b',
      id: '580bb478-4b8e-4d54-bc01-c30b1405653b',
    },
  ]);

  // For the dispense jobs created above, create the dispense job breakdowns:
  await db.insert(dispenseJobBreakdownTable).values([
    // For Mark Test Tenant:
    {
      dispenseJobId: '4d7f9096-810e-427c-9641-9aa77acf3d9b',
      cassetteId: 2,
      cassetteDenomination: 10,
      dispenseAmount: 10,
      dispenseCount: 1,
      status: 'pending',
      errorMessage: null,
      id: '72f3e2a8-cd8e-4c03-99fc-5e15d15c26cd',
    },
    // For updating the dispense amount of a dispense job:
    {
      dispenseJobId: '53240772-fd8d-41d0-b33b-2eb89e4d04cf',
      cassetteId: 2,
      cassetteDenomination: 10,
      dispenseAmount: 20,
      dispenseCount: 2,
      dispensedCount: 2,
      dispensedAt: new Date(),
      status: 'dispensed',
      errorMessage: null,
      id: '944b77ea-e5ca-4d32-b070-e73b5f62f30b',
    },

    // For User 2 Test Tenant:
    {
      dispenseJobId: '914791a0-8aae-4001-8ef7-aed4ba43f4f6',
      cassetteId: 2,
      cassetteDenomination: 10,
      dispenseAmount: 10,
      dispenseCount: 1,
      status: 'pending',
      errorMessage: null,
      id: '31cc2620-3ed9-416d-92e6-e1be2be334b8',
    },
    {
      id: '5411c581-5181-4762-a304-34f860b6f4e4',
      dispenseJobId: '580bb478-4b8e-4d54-bc01-c30b1405653b',
      cassetteId: 0,
      cassetteDenomination: 1,
      dispenseAmount: 3,
      dispenseCount: 3,
      dispensedCount: 0,
      dispensedAt: null,
      status: 'pending',
      errorMessage: null,
    },
  ]);

  process.exit(0);
}

execute();
