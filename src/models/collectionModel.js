import { z } from "zod";

export const createCollectionSchema = z.object({
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().max(1000).optional(),
    visibility: z.enum(["public", "privée"]).optional().default("public")
});