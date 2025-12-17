import { response } from "express";
import { request } from "express";

import jwt from 'jsonwebtoken';
import 'dotenv/config';

/**
 * 
 * @param {request} request 
 * @param {response} response 
 * @param {*} next 
 */
export const authenticateToken = (request, response, next) => {

    try {
        const authHeader = request.headers.authorization;
        
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) {
            return response.status(401).json({
                error: 'Access token required'
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // retourne le token déchiffré
        const userId = decodedToken.userId;        

        request.user = { userId };
        
        next();   
    } catch (error) {
        console.error("Error:", error);
        response.status(401).json({
            error: 'Invalid token'
        });
    }
}

export default authenticateToken;