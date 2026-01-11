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

    // Verify and decode JWT
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    request.user = {
      userId: decodedToken.userId
    };

    next();
  } catch (error) {
    console.error('JWT error:', error);

    response.status(401).json({
      error: 'Invalid token'
    });
  }
};

export default authenticateToken;
