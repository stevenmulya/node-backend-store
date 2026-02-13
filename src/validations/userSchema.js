import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'CUSTOMER']).optional(),
        fullName: z.string().min(1).max(100),
        phoneNumber: z.string().optional(),
        department: z.string().optional()
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
});