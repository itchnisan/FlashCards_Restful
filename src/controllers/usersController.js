import { eq } from "drizzle-orm";
import { request, response } from "express";
import { db } from "../db/database.js";
import { users } from "../db/schema.js";

/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
// Get authenticated user's information
export const getUserInfo = async (request, response) => {
    try {
        const { userId } = request.user;

        const [userInfo] = await db.select().from(users).where(eq(users.id, userId))
        
        if(!userInfo){
            response.status(404).json({error: "User information not found"})
        }

        response.status(201).json({ 
            message: 'User information successfuly retrieved.',
            data: userInfo,
        });
    } catch (error) {
        console.error("An error occured :", error);
    }
};


/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
export const getUser = async (request, response) => {
    try {
        const {userId} = request.params;

        
        const { isAdmin } = request.user;

        if(!isAdmin){
            return response.status(404).json({error: "Nothing to see here"})
        }

        const [userInfo] = await db.select().from(users).where(eq(users.id, userId))
        
        if(!userInfo){
            return response.status(404).json({error: "User information not found"})
        }

        response.status(201).json({ 
            message: 'User information successfuly retrieved.',
            data: userInfo,
        });
    } catch (error) {
        console.error("An error occured :", error);
    }
};

/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
export const deleteUser = async (request, response) => {
    try {
        const {userId} = request.params;

        const { isAdmin } = request.user;

        if(!isAdmin){
            return response.status(404).json({error: "Nothing to see here"})
        }

        const [user] = await db.select().from(users).where(eq(users.id, userId))
        
        if(!user){
            return response.status(404).json({error: "User not found"})
        }

        
        // await db.delete(flashcards).where(eq(flashcards.collectionId, collectionId));
        // await db.delete(collections).where(eq(collections.id, collectionId));
        await db.delete(users).where(eq(users.id, userId));

        response.json({ message: 'User, Collections and flashcards deleted' });
    } catch (error) {
        console.error("An error occured :", error);
    }
};

async function deleteCollection(request, response) {
  const { collectionId } = request.params;
  const userId = request.user.userId;
    const isAdmin = req.user.isAdmin;


  const [collection] = await db.select().from(collections).where(eq(collections.id, collectionId));
  if (!collection) return response.status(404).json({ message: 'Collection not found' });

  console.log(collection.ownerId)
  console.log(userId)
  if (collection.ownerId !== userId && !isAdmin) {
    return response.status(403).json({ message: 'You are not the owner' });
  }


  await db.delete(flashcards).where(eq(flashcards.collectionId, collectionId));
  await db.delete(collections).where(eq(collections.id, collectionId));
  response.json({ message: 'Collection and flashcards deleted' });
}


/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
export const getUsers = async (request, response) => {
    try {        
        const { isAdmin } = request.user;

        if(!isAdmin){
            return response.status(404).json({error: "Nothing to see here"})
        }

        const usersInfo = await db.select().from(users)

        response.status(201).json({ 
            message: 'User information successfuly retrieved.',
            data: usersInfo,
        });
    } catch (error) {
        console.error("An error occured :", error);
    }
};