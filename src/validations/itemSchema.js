import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    itemTypeId: z.number().int(),
    itemCategoryId: z.number().int(),
    name: z.string().min(3).max(255),
    slug: z.string().min(3).max(255),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'SUSPENDED']).default('DRAFT'),
    attributes: z.record(z.any()).optional(),
    variants: z.array(z.object({
      code: z.string().min(3),
      name: z.string().optional(),
      price: z.number().positive(),
      quantity: z.number().int().nonnegative(),
      options: z.record(z.any()).optional()
    })).min(1)
  })
});