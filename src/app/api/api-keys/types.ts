import { z } from 'zod';

export const zCreateAPIKeyInput = z.object({
  name: z.string(),
  expiration: z.coerce.date().optional(),
  tenantId: z.string().uuid(),
});

export const zDeleteAPIKeyInput = z.object({
  id: z.string().uuid(),
});

export type CreateAPIKeyInput = z.infer<typeof zCreateAPIKeyInput>;

export type APIKey = {
  id: string;
  key: string;
  name: string;
  createdAt: Date | string;
  expiration: Date | string;
  tenantId: string;
};
