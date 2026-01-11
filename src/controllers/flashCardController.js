import { db } from '../db/database.js';
import { flashcards, collections, studies } from '../db/schema.js';
import { eq, and, lte, or } from 'drizzle-orm';

/* -----------------------------
   CREATE FLASHCARD
-------------------------------- */

// Create a flashcard inside a collection
// - Only collection owner or admin can create
// - Initializes spaced repetition for the owner
export const createFlashcard = async (req, res) => {
  try {
    const { frontText, backText, frontUrls, backUrls, collectionId } = req.body;
    const {userId} = req.user

    // Check if collection exists
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId));

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Check access rights
    if (collection.ownerId !== userId && !req.user.isAdmin) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Create flashcard
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

    res.status(201).json(flashcard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* -----------------------------
   GET FLASHCARD BY ID
-------------------------------- */

// Get a flashcard by id
// - Private collections: only owner or admin
// - Public collections: accessible
export const getFlashcard = async (req, res) => {
  const { flashcardId } = req.params;
  const {userId, isAdmin} = req.user

  const [result] = await db
    .select({
      flashcard: flashcards,
      collection: collections,
    })
    .from(flashcards)
    .innerJoin(collections, eq(collections.id, flashcards.collectionId))
    .where(eq(flashcards.id, flashcardId));

  if (!result) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  const { collection } = result;
  console.log(collection);
  console.log(userId);
  console.log(isAdmin);

  // Check visibility and access
  if (
    collection.visibility === 'privée' &&
    collection.ownerId !== userId &&
    !isAdmin
  ) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  res.status(200).json(result.flashcard);
};

/* -----------------------------
   LIST FLASHCARDS OF COLLECTION
-------------------------------- */

// List all flashcards of a collection
// - Access depends on collection visibility
export const listFlashcardsByCollection = async (req, res) => {
  const { collectionId } = req.params;
  const {userId, isAdmin} = req.user;

  // Check if collection exists
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId));

  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  // Check access rights
  if (
    collection.visibility === 'privée' &&
    collection.ownerId !== userId &&
    !isAdmin
  ) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  const cards = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.collectionId, collectionId));

  res.status(200).json(cards);
};

/* -----------------------------
   UPDATE FLASHCARD
-------------------------------- */

// Update a flashcard
// - Only collection owner or admin
export const updateFlashcard = async (req, res) => {
    const { flashcardId } = req.params;

    const {userId} = req.user;

    const {frontText, backText, frontUrls, backUrls} = req.body;

    const [result] = await db
      .select({
        flashcard: flashcards,
        collection: collections,
      })
      .from(flashcards)
      .innerJoin(collections, eq(collections.id, flashcards.collectionId))
      .where(eq(flashcards.id, flashcardId));

    if (!result) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    // Check ownership
    if (result.collection.ownerId !== userId && !req.user.isAdmin) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    if(frontText === undefined && backText=== undefined && frontUrls=== undefined && backUrls=== undefined) {
        return res.status(400).json({ message: "No fields to update" });
    }

    const [updated] = await db
      .update(flashcards)
      .set({frontText, backText, frontUrls, backUrls})
      .where(eq(flashcards.id, flashcardId))
      .returning();

    res.status(200).json(updated);
};

/* -----------------------------
   DELETE FLASHCARD
-------------------------------- */

// Delete a flashcard
// - Only collection owner or admin
export const deleteFlashcard = async (req, res) => {
  const { flashcardId } = req.params;
  const {userId, isAdmin} = req.user;

  const [result] = await db
    .select({
      flashcard: flashcards,
      collection: collections,
    })
    .from(flashcards)
    .innerJoin(collections, eq(collections.id, flashcards.collectionId))
    .where(eq(flashcards.id, flashcardId));


  if (!result) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  // Check ownership
  if (result.collection.ownerId !== userId && !isAdmin) {
    return res.status(404).json({ message: 'Nothing to see here' });
  }

  await db.delete(flashcards).where(eq(flashcards.id, flashcardId));

  res.status(204).send({message:"Flashcard successfuly deleted"});
};

/* -----------------------------
   FLASHCARDS TO REVIEW
-------------------------------- */

// Get flashcards to review (spaced repetition)
// - Based on nextRevisionDate
export const flashcardsToReview = async (req, res) => {
  const { collectionId } = req.params;
  const {userId, isAdmin} = req.user;

  const cards = await db
    .select({
      flashcard: flashcards,
      study: studies,
    })
    .from(studies)
    .innerJoin(flashcards, eq(flashcards.id, studies.flashcardId))
    .where(
      and(
        eq(studies.userId, userId),
        eq(flashcards.collectionId, collectionId),
        lte(studies.nextRevisionDate, new Date())
      )
    );

  res.status(200).json(cards);
};

/* -----------------------------
   REVIEW FLASHCARD
-------------------------------- */

// Review a flashcard
// - Increases level
// - Calculates next revision date
export const reviewFlashcard = async (req, res) => {
  const { flashcardId } = req.params;
  const {userId} = req.user;

  // Review delays in days
  const delays = [1, 2, 4, 8, 16];

  const [study] = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.flashcardId, flashcardId),
        eq(studies.userId, userId)
      )
    );

  if (!study) {
    return res.status(404).json({ message: 'Study not found' });
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
