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

router.use(authMiddleware);

// Flashcard routes

router.post('/', validateBody(createFlashcardSchema), createFlashcard);

router.get(
  '/collection/:collectionId',
  validateParams(collectionIdSchema),
  listFlashcardsByCollection
);

router.get(
  '/collection/review/:collectionId/',
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
  '/review/:flashcardId',
  validateParams(flashcardIdSchema),
  reviewFlashcard
);

export default router;
