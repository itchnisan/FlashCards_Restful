import { request, response } from "express";
import { db } from "../db/database.js";
import { users } from "../db/schema.js";

import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

import 'dotenv/config';
import { eq } from "drizzle-orm";


/**
 * Allows autocomplete for request/response variables
 * so Express methods are suggested by the editor
 *
 * @param {request} request
 * @param {response} response
 *
 * Validation is already handled by middleware
 */

// Register a new user
// - Hashes the password
// - Stores the user in the database
// - Generates a JWT token (valid for 24 hours)
export const register = async (request, response) => {
    try {
        const { firstname, lastname, password, email } = request.body;

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the user into the database
        // .returning() returns an array, so we extract the first element
        const [newUser] = await database.insert(users).values({
            firstName: firstname,
            lastName: lastname,
            password: hashedPassword,
            email,
            isAdmin
        }).returning({
            email: users.email,
            id: users.id,
            isAdmin: users.isAdmin
        });

        // Create a JWT token valid for 24 hours
        const token = jwt.sign(
            {
                userId: newUser.id,
                isAdmin: newUser.isAdmin
            }, // Data embedded inside the JWT
            process.env.JWT_SECRET, // Secret key used to sign the token
            { expiresIn: '24h' }    // Token expiration time
        );

        response.status(201).json({
            message: 'User created',
            userData: newUser,
            token
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: 'Register failed, user may already exist',
        });
    }
};


// Login an existing user
// - Checks if the email exists
// - Verifies the password
// - Generates a JWT token (valid for 24 hours)
export const login = async (request, response) => {
    try {
        const { email, password } = request.body;

        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        // If user does not exist
        if (!user) {
            return response.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Compare the provided password with the hashed one
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return response.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Create a JWT token valid for 24 hours
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            }, // Data embedded inside the JWT
            process.env.JWT_SECRET, // Secret key used to sign the token
            { expiresIn: '24h' }    // Token expiration time
        );

        response.status(200).json({
            message: 'User logged in',
            userData: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            },
            token
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: 'Login failed'
        });
    }
};
