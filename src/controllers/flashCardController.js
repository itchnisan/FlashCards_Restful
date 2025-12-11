import { eq } from "drizzle-orm";
import { db } from "../db/database.js";
import { questions } from "../db/schema.js";
import { request, response } from "express";


export const getAllQuestions = async (request, response) => {
    try {
        const result = await db.select().from(questions).orderBy('created_at', 'desc');

        response.status(200).json(result);
    } catch (error) {
        response.status(500).send({
            error: 'Failed to query questions',
        });
    }
};

/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
export const createQuestions = async (request, response) => {   
    try {
        const { questionText, answer, difficulty } = request.body;
        const { userId } = request.user;

        // On fait déjà la validation avant donc ici c'est inutile et en plus 
        // comme on fait la validation avant le nom n'est plus le même
        // if(!question ||!answer) {
        //     return response.status(400).json({ error: "Question and answer are required!" });
        // }

        // const newQuestion = await db.insert(questions).values({
        //     questionText, 
        //     answer, 
        //     difficulty
        // }).returning(); // Vas retourner un tableau avec autant d'élément qu'on a ajouté
        
        const [newQuestion] = await db.insert(questions).values({
            questionText, 
            answer, 
            difficulty,
            createdBy: userId
        }).returning();
        
        response.status(201).json({ 
            message: 'Question created!',
            data: newQuestion,
        });
    } catch (error) {
        console.error(error)
        response.status(500).send({
            error: 'Failed to create question',
        })
    }

};

/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
export const deleteQuestion = async (request, response) => {
    try {
        const { id } = request.params;      // L'id on le passe dans les paramètres de l'url

        const { userId } = request.user;

        const [questionsUserId] = await db.select({createdBy: questions.createdBy}).from(questions).where(eq(questions.id, id))

        if(questionsUserId.createdBy !== userId) {
            return response.status(403).json({
                error: 'Forbidden'
            });
        }

        const [deletedQuestion] = await db
            .delete(questions)
            .where(eq(questions.id, id))
            .returning();
        if(!deletedQuestion){
            return response.status(404).json({
                message: 'Question not found.',
            }); // Ce early return permet d'éviter des else
        }
        response.status(200).send({ message: `Question ${id} deleted` });
    } catch (error) {
        console.error(error);
        response.status(500).send({
            error: 'Failed to delete question :' + error
        });
    }

};

/**
 * 
 * @param {request} request 
 * @param {response} response 
 */
export const getQuestion = async (request, response) => {
    const { id } = request.params;
    
    try {
        // const [{ questionText, answer, difficulty }] = await db.select().from(questions).where(eq(questions.id, id));
        // //=> Prend uniquement la 1ère valeur du tableau résultat
        // response.status(200).send({
        //     message: `
        //     Question : ${questionText},
        //     Answer : ${answer},
        //     Difficulty : ${difficulty}
        //     `
        // })

        const question = await db
            .select()
            .from(questions)
            .where(eq(questions.id, id));
            
        response.status(200).json(question);
    } catch (error) {
        console.error(error)
        response.status(500).send({
            error: 'Failed to query the question :' +error
        })
    }
}

// export const getAllQuestions = (request, response) => {
//     response.status(200).send([
//         {
//             id: '1',
//             question: 'Quelle est la capitale de la France ?',
//             answer: 'Paris',
//         }
//     ]);
// };

// export const createQuestions = (request, response) => {   
//     const { question, answer } = request.body;

//     if(!question ||!answer) {
//         return response.status(400).json({ error: "Question and answer are required!" });
//     }

//     response.status(201).send({ message: 'Question created!' });
// };

// export const deleteQuestion = (request, response) => {
//     const { id } = request.params;

//     response.status(200).send({ message: `Question ${id} deleted` });
// };