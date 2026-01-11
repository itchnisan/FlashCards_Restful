import { ZodType, ZodError } from 'zod';

/* -----------------------------
   BODY VALIDATION MIDDLEWARE
-------------------------------- */

// Validate request body using a Zod schema
// - Parses and transforms data if possible
// - Returns 400 if validation fails
export const validateBody = (schema) => {
  // Closure: returns a middleware function
  return (request, response, next) => {
    try {
      // Check if schema is a Zod schema
      if (schema instanceof ZodType) {
        // Parse and validate request body
        request.body = schema.parse(request.body);

        // Automatically converts compatible types (e.g. string to number)
        next();
      }
    } catch (error) {
      // Validation error
      if (error instanceof ZodError) {
        return response.status(400).json({
          error: 'Invalid body',
          details: error.issues,
        });
      }

      // Unexpected error
      console.error(error);
      response.status(500).json({
        error: 'Internal server error',
      });
    }
  };
};

/* -----------------------------
   PARAMS VALIDATION MIDDLEWARE
-------------------------------- */

// Validate request params using a Zod schema
// - Returns 400 if validation fails
export const validateParams = (schema) => {
  return (request, response, next) => {
    try {
      // Check if schema is a Zod schema
      if (schema instanceof ZodType) {
        // Parse and validate request params
        schema.parse(request.params);
        next();
      }
    } catch (error) {
      // Validation error
      if (error instanceof ZodError) {
        return response.status(400).json({
          error: 'Invalid params',
          details: error.issues.map(issue => issue.message),
        });
      }

      // Unexpected error
      console.error(error);
      response.status(500).json({
        error: 'Internal server error',
      });
    }
  };
};
