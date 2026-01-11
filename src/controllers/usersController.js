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