import { eq, and, like, lte, or } from "drizzle-orm";
import { db } from "../db/database.js";
import { flashcards, collections, studies } from "../db/schema.js";
import { request, response } from "express";

/**
 * Create a flashcard
 * @param {request} request
 * @param {response} response
 */
async function createFlashcard(request, response) {
    try {
        const { frontText, backText, frontUrls, backUrls, collectionId } = request.body;
        const { userId } = request.user;

        // Check if user owns the collection
        const collection = await db.select().from(collections).where(eq(collections.id, collectionId)).first();
        if (!collection) {
            return response.status(404).json({ error: 'Collection not found' });
        }
        if (collection.ownerId !== userId) {
            return response.status(403).json({ error: 'You do not own this collection' });
        }

        const [newFlashcard] = await db.insert(flashcards).values({
            frontText,
            backText,
            frontUrls,
            backUrls,
            collectionId
        }).returning();

        response.status(201).json({
            message: 'Flashcard created!',
            data: newFlashcard,
        });
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to create flashcard',
        });
    }
}

/**
 * Get a flashcard by ID
 * @param {request} request
 * @param {response} response
 */
async function getFlashcard(request, response) {
    const { flashcardId } = request.params;
    const { userId } = request.user;

    try {
        const flashcard = await db.select().from(flashcards).where(eq(flashcards.id, flashcardId)).first();
        if (!flashcard) {
            return response.status(404).json({ error: 'Flashcard not found' });
        }

        const collection = await db.select().from(collections).where(eq(collections.id, flashcard.collectionId)).first();

        // Accessible if collection is public, or user is owner, or admin
        if (collection.visibility !== 'public' && collection.ownerId !== userId && !request.user.isAdmin) {
            return response.status(403).json({ error: 'Access denied' });
        }

        response.status(200).json(flashcard);
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to get flashcard: ' + error
        });
    }
}

/**
 * List flashcards in a collection
 * @param {request} request
 * @param {response} response
 */
async function listFlashcardsInCollection(request, response) {
    const { collectionId } = request.params;
    const { userId } = request.user;

    try {
        const collection = await db.select().from(collections).where(eq(collections.id, collectionId)).first();
        if (!collection) {
            return response.status(404).json({ error: 'Collection not found' });
        }

        // Respect visibility
        if (collection.visibility !== 'public' && collection.ownerId !== userId && !request.user.isAdmin) {
            return response.status(403).json({ error: 'Access denied' });
        }

        const flashcardsList = await db.select().from(flashcards).where(eq(flashcards.collectionId, collectionId));

        response.status(200).json(flashcardsList);
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to list flashcards: ' + error
        });
    }
}

/**
 * Get flashcards to review in a collection
 * @param {request} request
 * @param {response} response
 */
async function getFlashcardsToReview(request, response) {
    const { collectionId } = request.params;
    const { userId } = request.user;

    try {
        const collection = await db.select().from(collections).where(eq(collections.id, collectionId)).first();
        if (!collection) {
            return response.status(404).json({ error: 'Collection not found' });
        }

        // Only owner or admin
        if (collection.ownerId !== userId && !request.user.isAdmin) {
            return response.status(403).json({ error: 'Access denied' });
        }

        const now = new Date();
        const dueFlashcards = await db
            .select({ flashcard: flashcards })
            .from(studies)
            .innerJoin(flashcards, eq(studies.flashcardId, flashcards.id))
            .where(and(
                eq(studies.userId, userId),
                eq(flashcards.collectionId, collectionId),
                lte(studies.nextRevisionDate, now)
            ));

        response.status(200).json(dueFlashcards.map(item => item.flashcard));
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to get flashcards to review: ' + error
        });
    }
}

/**
 * Update a flashcard
 * @param {request} request
 * @param {response} response
 */
async function updateFlashcard(request, response) {
    const { flashcardId } = request.params;
    const { frontText, backText, frontUrls, backUrls } = request.body;
    const { userId } = request.user;

    try {
        const flashcard = await db.select().from(flashcards).where(eq(flashcards.id, flashcardId)).first();
        if (!flashcard) {
            return response.status(404).json({ error: 'Flashcard not found' });
        }

        const collection = await db.select().from(collections).where(eq(collections.id, flashcard.collectionId)).first();

        if (collection.ownerId !== userId) {
            return response.status(403).json({ error: 'You do not own this collection' });
        }

        await db.update(flashcards).set({
            frontText,
            backText,
            frontUrls,
            backUrls
        }).where(eq(flashcards.id, flashcardId));

        response.status(200).json({ message: 'Flashcard updated' });
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to update flashcard: ' + error
        });
    }
}

/**
 * Delete a flashcard
 * @param {request} request
 * @param {response} response
 */
async function deleteFlashcard(request, response) {
    const { flashcardId } = request.params;
    const { userId } = request.user;

    try {
        const flashcard = await db.select().from(flashcards).where(eq(flashcards.id, flashcardId)).first();
        if (!flashcard) {
            return response.status(404).json({ error: 'Flashcard not found' });
        }

        const collection = await db.select().from(collections).where(eq(collections.id, flashcard.collectionId)).first();

        if (collection.ownerId !== userId) {
            return response.status(403).json({ error: 'You do not own this collection' });
        }

        await db.delete().from(flashcards).where(eq(flashcards.id, flashcardId));

        response.status(200).json({ message: 'Flashcard deleted' });
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to delete flashcard: ' + error
        });
    }
}

/**
 * Review a flashcard
 * @param {request} request
 * @param {response} response
 */
async function studyFlashcard(request, response) {
    const { flashcardId } = request.params;
    const { correct } = request.body; // assume boolean: true if correct, false if not
    const { userId } = request.user;

    try {
        const flashcard = await db.select().from(flashcards).where(eq(flashcards.id, flashcardId)).first();
        if (!flashcard) {
            return response.status(404).json({ error: 'Flashcard not found' });
        }

        const collection = await db.select().from(collections).where(eq(collections.id, flashcard.collectionId)).first();

        // Can review if owner or collection is public
        if (collection.ownerId !== userId && collection.visibility !== 'public') {
            return response.status(403).json({ error: 'Access denied' });
        }

        // Get or create study record
        let study = await db.select().from(studies).where(and(eq(studies.userId, userId), eq(studies.flashcardId, flashcardId))).first();
        if (!study) {
            const [newStudy] = await db.insert(studies).values({
                userId,
                flashcardId
            }).returning();
            study = newStudy;
        }

        // Update level and dates
        let newLevel = study.level;
        if (correct) {
            newLevel += 1;
        } else {
            newLevel = Math.max(1, newLevel - 1);
        }

        const now = new Date();
        const nextDate = new Date(now);
        // Simple spaced repetition: level 1: +1 day, 2: +3, 3: +7, 4: +14, 5: +30
        const days = [0, 1, 3, 7, 14, 30][newLevel] || 30;
        nextDate.setDate(nextDate.getDate() + days);

        await db.update(studies).set({
            level: newLevel,
            lastRevisionDate: now,
            nextRevisionDate: nextDate
        }).where(eq(studies.id, study.id));

        response.status(200).json({ message: 'Flashcard reviewed', newLevel, nextRevisionDate: nextDate });
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to review flashcard: ' + error
        });
    }
}

export {
    createFlashcard,
    getFlashcard,
    listFlashcardsInCollection,
    getFlashcardsToReview,
    updateFlashcard,
    deleteFlashcard,
    studyFlashcard
};