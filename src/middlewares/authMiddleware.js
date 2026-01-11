import { request, response } from "express";
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Middleware to authenticate requests using JWT
// - Extracts token from Authorization header
// - Verifies token validity
// - Attaches user info to request object
export const authenticateToken = (request, response, next) => {
  try {
    // Get Authorization header
    const authHeader = request.headers.authorization;

    // Extract token (Bearer <token>)
    const token = authHeader && authHeader.split(' ')[1];

    // No token provided
        if (!token) {
            return response.status(401).json({
                error: 'Access token required'
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // retourne le token déchiffré
        
        const userId = decodedToken.userId;        
        const isAdmin = decodedToken.isAdmin;    

        request.user = { userId, isAdmin };
        
        next();   
    } catch (error) {
        console.error("Error:", error);
        response.status(401).json({
            error: 'Invalid token'
        });
    }
};

export default authenticateToken;
