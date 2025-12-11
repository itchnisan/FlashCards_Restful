import { database } from './database.js';
import { collections, studies, flashcards, users } from './schema.js';

import bcrypt from 'bcrypt';

const seed = async () => {

    console.log('Starting database seeding...');

    try{
        await database.delete(users);
        await database.delete(collections);
        await database.delete(flashcards);
        await database.delete(studies);

        const defaultPassword = "123456";
        const louisonPassword = await bcrypt.hash(defaultPassword, 12);
        const leopaulPassword = await bcrypt.hash(defaultPassword, 12);
        const adminPassword = await bcrypt.hash(defaultPassword, 12);

        const seedUsers = [
            {
                email: "louison.courtois@gmail.com",
                firstName: "Louison",
                lastName: "Courtois",
                password: louisonPassword
            },
            {
                email: "leo-paul.marie@gmail.com",
                firstName: "Léo-Paul",
                lastName: "Marie",
                password: leopaulPassword
            },
            {
                email: "admin@gmail.com",
                firstName: "Admin",
                lastName: "Super",
                password: adminPassword,
                isAdmin: true
            }
        ];

        const usersInfo = (await database.insert(users).values(seedUsers).returning());
        const usersId = usersInfo.map(function (userInfo){
            return userInfo["id"];
        });

        console.log(usersInfo);
        console.log(usersId);

        const seedCollections = [

        ];

        const seedFlashcards = [

        ]

        const seedStudies = [

        ]

    }catch(error) {
        console.log("An error occured: " + error);
    }
};

seed();