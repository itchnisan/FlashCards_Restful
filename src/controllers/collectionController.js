import { and, eq, like, or } from "drizzle-orm";
import { db } from "../db/database.js";
import { collections,flashcards } from "../db/schema.js";
import { request, response } from "express";



/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// Create a new collection for the authenticated user
async function createCollection(request, response) {   
    try {
        const { title, description, visibility } = request.body;
        const { userId } = request.user;

        // Insert collection into database
        const [newCollection] = await db.insert(collections).values({
            title,
            description,
            visibility,
            ownerId: userId
        }).returning();
        
        response.status(201).json({ 
            message: 'Collection created!',
            data: newCollection,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: 'Failed to create collection',
        });
    }
}


/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// Get a single collection by id
// - Private collections: only owner can access
// - Public collections: accessible to everyone
async function getCollection(request, response) {
    const { collectionId } = request.params;
    const { userId } = request.user;
    
    try {
        const [collection] = await db
            .select()
            .from(collections)
            .where(
                and(
                    eq(collections.id, collectionId),
                    or(
                        eq(collections.ownerId, userId),
                        eq(collections.visibility, "public")
                    )
                )
            );

        if (!collection) {
            return response.status(404).json({ error: "Collection not found" });
        }

        response.status(200).json(collection);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: 'Failed to fetch collection'
        });
    }
}



/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// List all collections owned by the authenticated user
async function listCollections(request, response) {
    const userId = request.user.userId;

    const userCollections = await db
        .select()
        .from(collections)
        .where(eq(collections.ownerId, userId));

    response.json(userCollections);
}



/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// Search public collections by title
// - If no title is provided, return all public collections
async function searchPublicCollections(request, response) {
    const { title } = request.query;

    // Return all public collections
    if (!title) {
        const collectionsList = await db
            .select()
            .from(collections)
            .where(eq(collections.visibility, 'public'));

        return response.json(collectionsList);
    }

    // Search public collections by title
    const collectionsList = await db
        .select()
        .from(collections)
        .where(
            and(
                eq(collections.visibility, 'public'),
                like(collections.title, `%${title}%`)
            )
        );

    response.json(collectionsList);
}


/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// Delete a collection and its flashcards
// - Only the owner can delete
async function deleteCollection(request, response) {
    const { collectionId } = request.params;
    const userId = request.user.userId;

    // Check if collection exists
    const [collection] = await db
        .select()
        .from(collections)
        .where(eq(collections.id, collectionId));

    if (!collection) {
        return response.status(404).json({ message: 'Collection not found' });
    }

    // Check ownership
    if (collection.ownerId !== userId) {
        return response.status(403).json({ message: 'You are not the owner' });
    }

    // Delete related flashcards first
    await db.delete(flashcards).where(eq(flashcards.collectionId, collectionId));

    // Delete collection
    await db.delete(collections).where(eq(collections.id, collectionId));

    response.json({ message: 'Collection and flashcards deleted' });
}




/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// Update a collection
// - Only owner can update
// - At least one field must be provided
async function updateCollection(req, res) {
    const { collectionId } = req.params;
    const { title, description, visibility } = req.body;
    const userId = req.user.userId;

    // No fields to update
    if (title === undefined && description === undefined && visibility === undefined) {
        return res.status(400).json({ message: "No fields to update" });
    }

    // Check if collection exists
    const [collection] = await db
        .select()
        .from(collections)
        .where(eq(collections.id, collectionId));

    if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
    }

    // Check ownership
    if (collection.ownerId !== userId) {
        return res.status(403).json({ message: 'You are not the collection owner' });
    }

    // Update collection
    await db
        .update(collections)
        .set({ title, description, visibility })
        .where(eq(collections.id, collectionId));

    res.json({ message: 'Collection updated' });
}


export {
  createCollection,
  getCollection,
  listCollections,
  searchPublicCollections,
  updateCollection,
  deleteCollection
};
