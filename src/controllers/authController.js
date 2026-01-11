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
export const register = async (request, response) => {
    
    try {
        console.log("Beginning...");
        const { firstname, lastname, password, email } = request.body;
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // On met les crochet [] car le .returning() nous
        // renvoie un tableau avec un seul user, celui 
        // que l'on vient de créer. Cela permet d'avoir
        // uniquement la 1ère valeur
        const [newUser] = await database.insert(users).values({
            // L'ordre des valeurs n'a pas d'importance 
            // car le nom de la colonne est déjà spécifié
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
            // token: 'TOKEN_JWT'
            token
        });
        console.log("Ending.");
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: 'Register failed',
        })
    }
}

export const login = async (request, response) => {
    try {
        const { email, password } = request.body;

        const [user] = await db.select().from(users).where(eq(users.email, email));
        
        if(!user) {
            return response.status(401).json({
                // error: "Invalid email or password"
                error : "Invalid credentials"
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if(!isValidPassword){
            response.status(401).json({
                error : "Invalid credentials"
            });
        }

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
            error: 'Login failed',
        })
    }
};