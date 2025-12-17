import express from 'express';
import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis le fichier .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
import authRoutes from './routers/authRouter.js';
import userRoutes from './routers/userRouter.js';
import collectionRoutes from './routers/collectionRouter.js';
import flashCardRoutes from './routers/flashCardRouter.js';

// Utiliser les routes
app.use('/api/auth', authRoutes);
//app.use('/api/users', userRoutes);
app.use('/api/collection', collectionRoutes);
//app.use('/api/flashcards', flashCardRoutes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
