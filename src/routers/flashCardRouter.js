import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateBody, validateParams } from '../middlewares/validation.js';

import {
  createFlashcard,
  getFlashcard,
  listFlashcardsByCollection,
  updateFlashcard,
  deleteFlashcard,
  flashcardsToReview,
  reviewFlashcard,
} from '../controllers/flashCardController.js';

import {
  createFlashcardSchema,
  updateFlashcardSchema,
  flashcardIdSchema
} from '../models/flashCardsModel.js';
import { collectionIdSchema } from '../models/collectionModel.js';

const router = Router();

// Apply authentication middleware to all flashcard routes
router.use(authMiddleware);

// Flashcard routes

// Create a new flashcard
router.post(
  '/',
  validateBody(createFlashcardSchema),
  createFlashcard
);

// Get all flashcards from a specific collection
router.get(
  '/collection/:collectionId',
  validateParams(collectionIdSchema),
  listFlashcardsByCollection
);

// Get flashcards to review for a specific collection (spaced repetition)
router.get(
  '/collection/review/:collectionId/',
  validateParams(collectionIdSchema),
  flashcardsToReview
);

// Get a single flashcard by its ID
router.get(
  '/:flashcardId',
  validateParams(flashcardIdSchema),
  getFlashcard
);

// Update an existing flashcard
router.patch(
  '/:flashcardId',
  validateParams(flashcardIdSchema),
  validateBody(updateFlashcardSchema),
  updateFlashcard
);

// Delete a flashcard
router.delete(
  '/:flashcardId',
  validateParams(flashcardIdSchema),
  deleteFlashcard
);

// Review a flashcard (update spaced repetition data)
router.post(
  '/review/:flashcardId',
  validateParams(flashcardIdSchema),
  reviewFlashcard
);

export default router;
