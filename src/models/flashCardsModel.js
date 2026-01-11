import { z } from 'zod';

// Schema for flashcard operations

//vaidate flashcard ID parameter
export const flashcardIdSchema = z.object({
  flashcardId: z.string().uuid(),
});

export const collectionIdSchema = z.object({
  collectionId: z.string().uuid(),
});


export const createFlashcardSchema = z.object({
  frontText: z.string().min(1),
  backText: z.string().min(1),
  frontUrls: z.string().nullable().optional(),
  backUrls: z.string().nullable().optional(),
  collectionId: z.string().uuid(),
});

export const updateFlashcardSchema = z.object({
  frontText: z.string().min(1).optional(),
  backText: z.string().min(1).optional(),
  frontUrls: z.string().nullable().optional(),
  backUrls: z.string().nullable().optional(),
});
