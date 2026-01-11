import { request, response } from "express";
import { db } from "../db/database.js";
import { users } from "../db/schema.js";

import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

import 'dotenv/config';
import { eq } from "drizzle-orm";


/**
 * Permet d'avoir l'autocomplétion de ces variables
 * pour avoir les méthodes associées proposées
 * @param {request} request 
 * @param {response} response
 * 
 * La validation a déjà été faites par le middleware 
 */
// Register a new user
// - Hashes the password
// - Stores the user in database
// - Generates a JWT token (24h)
export const register = async (request, response) => {
    try {
        const { firstname, lastname, password, email } = request.body;

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into database
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

        // Create JWT token valid for 24 hours
        const token = jwt.sign(
            { 
                userId: newUser.id,
                isAdmin: newUser.isAdmin
            },   // Toutes les données que l'on vas chiffrer dans le user token
            process.env.JWT_SECRET,  // 2ème argument c'est la clé secrète
            // { expiresIn: '24j' }     // token valide pendant 24 jours
            { expiresIn: '24h' }        // token valide 24 heures
        );

        response.status(201).json({
            message: 'User created',
            userData: newUser,
            token
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: 'Register failed'
        });
    }
};


// Login an existing user
// - Checks email
// - Verifies password
// - Generates a JWT token (24h)
export const login = async (request, response) => {
    try {
        const { email, password } = request.body;

        // Find user by email
        const [user] = await db.select().from(users).where(eq(users.email, email));

        // If user does not exist
        if (!user) {
            return response.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return response.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Create JWT token valid for 24 hours
        const token = jwt.sign(
            { userId: user.id, isAdmin: user.isAdmin },   // Toutes les données que l'on vas chiffrer dans le user token
            process.env.JWT_SECRET,  // 2ème argument c'est la clé secrète
            // { expiresIn: '24j' }     // token valide pendant 24 jours
            { expiresIn: '24h' }        // token valide 24 heures
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
