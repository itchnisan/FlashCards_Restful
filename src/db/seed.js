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
            {
                title: "R5.09 Virtu",
                description: "QCM pour réviser",
                ownerId: usersId[0]
            },
            {
                title: "R5.01 Management des équipes",
                visibility: "privée",
                ownerId: usersId[1]
            },
            {
                title: "Fortnite",
                visibility: "public",
                ownerId: usersId[0]
            },
            {
                title: "Fonctionnement de notre application",
                visibility: "privée",
                ownerId: usersId[2]
            }
        ];

        const collectionsInfo = (await database.insert(collections).values(seedCollections).returning());
        const collectionsId = collectionsInfo.map(function (collectionInfo){
            return collectionInfo["id"];
        });

        console.log(collectionsInfo);
        console.log(collectionsId);

        const seedFlashcards = [
            {
                collectionId: collectionsId[0],
                frontText: "Qu'est ce qu'une application Cloud Native ?",
                backText: "Une application qui ..."
            },
            {
                collectionId: collectionsId[0],
                frontText: "Qu'est ce qu'une application SaaS ?",
                backText: "Une application qui ...",
                frontUrls: "https://www.baeldung.com/wp-content/uploads/sites/4/2023/06/Function-as-a-service-1-1.jpg"
            },
            {
                collectionId: collectionsId[0],
                frontText: "Qu'est ce qu'une application FaaS ?",
                backText: "Une application qui ...",
                backUrls: "https://www.google.com/url?sa=t&source=web&rct=j&url=https%3A%2F%2Fitsocial.fr%2Fenjeux-it%2Fenjeux-cloud-computing%2Fmulticloud%2Ffaas-functions-as-a-service-revolution-serverless%2F&ved=0CBUQjRxqFwoTCPC5-damxJEDFQAAAAAdAAAAABAH&opi=89978449"
            },
            {
                collectionId: collectionsId[1],
                frontText: "Quelle est la particularité d'une équipe projet ?",
                backText: "C'est une équipe temporaire.",
                frontUrls: "https://www.lecoindesentrepreneurs.fr/wp-content/uploads/2021/10/constituer-une-equipe-projet-1.png",
                backUrls: "https://fiches-pratiques.chefdentreprise.com/wp-content/uploads/2025/09/Comment-entretenir-cohesion-equipe-distance-F.jpg"
            }
        ]

        

        const flashcardsInfo = (await database.insert(flashcards).values(seedFlashcards).returning());
        const flashcardsId = flashcardsInfo.map(function (flashcardInfo){
            return flashcardInfo["id"];
        });

        console.log(flashcardsInfo);
        console.log(flashcardsId);


        const today = new Date();
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate()+1)
        const dateLevel3 = new Date(today)
        dateLevel3.setDate(dateLevel3.getDate()+4)
        const dateLevel5 = new Date(today)
        dateLevel5.setDate(dateLevel5.getDate()+16)

        const seedStudies = [
            {
                lastRevisionDate: today,
                nextRevisionDate: nextDay,
                userId: usersId[0],
                flashcardId: flashcardsId[0]
            },
            {
                lastRevisionDate: today,
                nextRevisionDate: dateLevel3,
                level: 3,
                userId: usersId[0],
                flashcardId: flashcardsId[1]
            },
            {
                lastRevisionDate: today,
                nextRevisionDate: dateLevel5,
                level: 5,
                userId: usersId[0],
                flashcardId: flashcardsId[2]
            },
            {
                lastRevisionDate: today,
                nextRevisionDate: nextDay,
                level: 1,
                userId: usersId[1],
                flashcardId: flashcardsId[3]
            },
        ]

        
        const studiesInfo = (await database.insert(studies).values(seedStudies).returning());
        const studiesId = studiesInfo.map(function (studyInfo){
            return studyInfo["id"];
        });

        console.log(studiesInfo);
        console.log(studiesId);

    }catch(error) {
        console.log("An error occured: ");
        console.error(error)
    }
};

seed();