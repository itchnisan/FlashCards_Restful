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
  flashcardIdSchema,
  collectionIdSchema,
} from '../models/flashCardsModel.js';

const router = Router();

router.use(authMiddleware);

// Flashcard routes

router.post('/', validateBody(createFlashcardSchema), createFlashcard);

router.get(
  '/collection/:collectionId',
  validateParams(collectionIdSchema),
  listFlashcardsByCollection
);

router.get(
  '/collection/:collectionId/review',
  validateParams(collectionIdSchema),
  flashcardsToReview
);

router.get(
  '/:flashcardId',
  validateParams(flashcardIdSchema),
  getFlashcard
);

router.patch(
  '/:flashcardId',
  validateParams(flashcardIdSchema),
  validateBody(updateFlashcardSchema),
  updateFlashcard
);

router.delete(
  '/:flashcardId',
  validateParams(flashcardIdSchema),
  deleteFlashcard
);

router.post(
  '/:flashcardId/review',
  validateParams(flashcardIdSchema),
  reviewFlashcard
);

export default router;
