import { z } from 'zod';

export const zCreateTenantInput = z.object({
  name: z.string(),
  CDUKey: z.string().optional(),
});

export const zUpdateTenantInput = z.object({
  name: z.string(),
  CDUKey: z.string().optional(),
});

export type Tenant = {
  name: string;
  CDUKey: string | null;
  id: string;
  createdAt: Date;
  owner: string;
};

export type TenantsAndRole = {
  tenant: Tenant;
  role: string;
};
