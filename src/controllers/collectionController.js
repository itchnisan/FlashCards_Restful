import { eq } from "drizzle-orm";
import { db } from "../db/database.js";
import { collections,flashcards } from "../db/schema.js";
import { request, response } from "express";



/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
async function createCollection (request, response){   
    try {
        const { titre, description, visibility } = request.body;
        const { userId } = request.user;

        const [newCollection] = await db.insert(collections).values({
            titre, 
            description, 
            visibility,
            owner_id: userId
        }).returning();
        
        response.status(201).json({ 
            message: 'Collection created!',
            data: newCollection,
        });
    } catch (error) {
        console.error(error)
        response.status(500).send({
            error: 'Failed to create Collection',
        })
    }

};
/*
- **Consulter une collection**
    - Récupérer les infos d’une collection avec son identifiant.
    - Une collection privée ne doit être accessible qu’à son propriétaire (ou à un administrateur).
    - Les collections publiques sont accessibles par tous les utilisateurs authentifiés.
*/
/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
async function getCollection (request, response){
    const { id } = request.params;
    const { userId } = request.user;
    
    try {

        const collection = await db
            .select()
            .from(collections)
            .where(collections.id , id)
            .andWhere(collections.ownerId,userId);
        
        
        response.status(200).json(collection);
    } catch (error) {
        console.error(error)
        response.status(500).send({
            error: 'Failed to query the question :' +error
        })
    }
}


/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
async function listCollections(request, response) {
  const userId = request.userId;

  const userCollections = await db.select().from(collections).where(collections.ownerId, userId);
  response.json(userCollections);
}


/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
async function searchPublicCollections(request, response) {
  const { title } = request.query;

  const titleCollections = await db.select().from(collections).where(collections.visibility, 'public').andWhere(collections.title, 'like', `%${title}%`);
  response.json(titleCollections);
}

/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
async function deleteCollection(request, response) {
  const { collectionId } = request.params;
  const userId = request.userId;


  const collection = await db.select().from(collections).where(collections.id, collectionId).first();
  if (!collection) return response.status(404).json({ message: 'Collection non trouvée' });

  if (collection.owner_id !== userId) {
    return response.status(403).json({ message: 'Vous n\'êtes pas le propriétaire de cette collection' });
  }


  await db.delete().from(flashcards).where(flashcards.collectionId, collectionId);
  await db.delete().from(collections).where(collections.id, collectionId);
  response.json({ message: 'Collection et flashcards supprimées' });
}



/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
async function updateCollection(req, res) {
  const { collectionId } = req.params;
  const { title, description, visibility } = req.body;
  const userId = req.userId;

  const collection = await db.select().from(collections).where(collections.id, collectionId).first();
  if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

  if (collection.owner_id !== userId) {
    return res.status(403).json({ message: 'Vous n\'êtes pas le propriétaire de cette collection' });
  }

  await db.update(collections).set({ title, description, visibility }).where(collections.id, collectionId);
  res.json({ message: 'Collection mise à jour' });
}

export {
  createCollection,
  getCollection,
  listCollections,
  searchPublicCollections,
  updateCollection,
  deleteCollection
};
