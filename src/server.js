import express from 'express';
import { config } from 'dotenv';

config(); // Load environment variables from the .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Import route handlers
import authRoutes from './routers/authRouter.js';
import usersRoutes from './routers/usersRouter.js';
import collectionRoutes from './routers/collectionRouter.js';
import flashCardRoutes from './routers/flashCardRouter.js';

// Register API routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/flashcard', flashCardRoutes);
app.use('/api/user', usersRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
