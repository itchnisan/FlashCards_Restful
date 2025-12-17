import { ZodType, ZodError } from 'zod';
// Si on était en TypeScript on aurait pu faire ça 
// avec en plus schema : ZodType mais en js on ne peux pas

export const validateBody = (schema) => {
    // closure = une fonction qui retourne une autre fonction
    // Quand une fonction renvoie une autre fonction
    // la fonction enfant a accès à un sac à dos
    // 
    return (request, response, next) => {
        try {
            if(schema instanceof ZodType) {
                request.body = schema.parse(request.body);
                // s'il y a de la donnée qu'il peut convertir automatiquement il le fera
                // c'est le type conversion, par exemple un nombre en chaine de caractère
                // sera convertir en int

                next();
            }
        } catch( error ) {
            if(error instanceof ZodError) {
                return response.status(400).json({
                    error: 'Invalid body',
                    details: error.issues,
                });
            }
            console.error(error);
            response.status(500).send({
                error: 'Internal Server error'
            });
        }
    }
}


export const validateParams = (schema) => {
    return (request, response, next) => {
        try {
            if(schema instanceof ZodType) {
                schema.parse(request.params);
                next();
            }
        } catch( error ) {
            if(error instanceof ZodError) {
                return response.status(400).json({
                    error: 'Invalid params',
                    details: error.issues.map((issue) => { return issue.message; }),
                });
            }
            console.error(error);
            response.status(500).send({
                error: 'Internal Server error'
            });
        }
    }
}