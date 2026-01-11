import { db } from '../db/client.js';
import { flashcards, collections, studies } from '../db/schema.js';
import { eq, and, lte } from 'drizzle-orm';

/* -----------------------------
   CREATE FLASHCARD
-------------------------------- */
export const createFlashcard = async (req, res) => {
  try {
    const { frontText, backText, frontUrls, backUrls, collectionId } = req.body;

    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId));

    if (!collection) {
      return res.status(404).json({ message: 'Collection introuvable' });
    }

    if (collection.ownerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const [flashcard] = await db
      .insert(flashcards)
      .values({
        frontText,
        backText,
        frontUrls,
        backUrls,
        collectionId,
      })
      .returning();

    // Initialisation de la répétition espacée pour le propriétaire
    await db.insert(studies).values({
      userId: req.user.id,
      flashcardId: flashcard.id,
    });

    res.status(201).json(flashcard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -----------------------------
   GET FLASHCARD BY ID
-------------------------------- */
export const getFlashcard = async (req, res) => {
  const { flashcardId } = req.params;

  const [result] = await db
    .select({
      flashcard: flashcards,
      collection: collections,
    })
    .from(flashcards)
    .innerJoin(collections, eq(collections.id, flashcards.collectionId))
    .where(eq(flashcards.id, flashcardId));

  if (!result) {
    return res.status(404).json({ message: 'Flashcard introuvable' });
  }

  const { collection } = result;

  if (
    collection.visibility === 'privée' &&
    collection.ownerId !== req.user.id &&
    !req.user.isAdmin
  ) {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  res.json(result.flashcard);
};

/* -----------------------------
   LIST FLASHCARDS OF COLLECTION
-------------------------------- */
export const listFlashcardsByCollection = async (req, res) => {
  const { collectionId } = req.params;

  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId));

  if (!collection) {
    return res.status(404).json({ message: 'Collection introuvable' });
  }

  if (
    collection.visibility === 'privée' &&
    collection.ownerId !== req.user.id &&
    !req.user.isAdmin
  ) {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  const cards = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.collectionId, collectionId));

  res.json(cards);
};

/* -----------------------------
   UPDATE FLASHCARD
-------------------------------- */
export const updateFlashcard = async (req, res) => {
  const { flashcardId } = req.params;

  const [result] = await db
    .select({
      flashcard: flashcards,
      collection: collections,
    })
    .from(flashcards)
    .innerJoin(collections, eq(collections.id, flashcards.collectionId))
    .where(eq(flashcards.id, flashcardId));

  if (!result) {
    return res.status(404).json({ message: 'Flashcard introuvable' });
  }

  if (result.collection.ownerId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  const [updated] = await db
    .update(flashcards)
    .set(req.body)
    .where(eq(flashcards.id, flashcardId))
    .returning();

  res.json(updated);
};

/* -----------------------------
   DELETE FLASHCARD
-------------------------------- */
export const deleteFlashcard = async (req, res) => {
  const { flashcardId } = req.params;

  const [result] = await db
    .select({
      flashcard: flashcards,
      collection: collections,
    })
    .from(flashcards)
    .innerJoin(collections, eq(collections.id, flashcards.collectionId))
    .where(eq(flashcards.id, flashcardId));

  if (!result) {
    return res.status(404).json({ message: 'Flashcard introuvable' });
  }

  if (result.collection.ownerId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  await db.delete(flashcards).where(eq(flashcards.id, flashcardId));

  res.status(204).send();
};

/* -----------------------------
   FLASHCARDS TO REVIEW
-------------------------------- */
export const flashcardsToReview = async (req, res) => {
  const { collectionId } = req.params;

  const cards = await db
    .select({
      flashcard: flashcards,
      study: studies,
    })
    .from(studies)
    .innerJoin(flashcards, eq(flashcards.id, studies.flashcardId))
    .where(
      and(
        eq(studies.userId, req.user.id),
        eq(flashcards.collectionId, collectionId),
        lte(studies.nextRevisionDate, new Date())
      )
    );

  res.json(cards);
};

/* -----------------------------
   REVIEW FLASHCARD
-------------------------------- */
export const reviewFlashcard = async (req, res) => {
  const { flashcardId } = req.params;

  const delays = [1, 2, 4, 8, 16];

  const [study] = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.flashcardId, flashcardId),
        eq(studies.userId, req.user.id)
      )
    );

  if (!study) {
    return res.status(404).json({ message: 'Aucune étude trouvée' });
  }

  const newLevel = Math.min(study.level + 1, 5);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + delays[newLevel - 1]);

  const [updated] = await db
    .update(studies)
    .set({
      level: newLevel,
      lastRevisionDate: new Date(),
      nextRevisionDate: nextDate,
    })
    .where(eq(studies.id, study.id))
    .returning();

  res.json(updated);
};
