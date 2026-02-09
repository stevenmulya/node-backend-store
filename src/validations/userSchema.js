import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(100),
        email: z.string().email('Invalid email format').min(1),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        level: z.preprocess(
            (val) => (val === undefined || val === '' ? undefined : Number(val)), 
            z.number().int().min(1).max(3).optional()
        )
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format').min(1),
        password: z.string().min(1, 'Password is required')
    })
});