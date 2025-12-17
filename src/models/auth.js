import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email(),
    firstname: z.string().min(3),
    lastname: z.string().min(3),
    password: z.string().min(6).max(255)
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6).max(255)
});