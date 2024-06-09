import { z } from 'zod';

export const zCreateTenantInput = z.object({
  name: z.string(),
});

export const zUpdateTenantInput = z.object({
  name: z.string(),
});

export type Tenant = {
  name: string;
  id: string;
  createdAt: Date;
  owner: string;
};

export type TenantsAndRole = {
  tenant: Tenant;
  role: string;
};
