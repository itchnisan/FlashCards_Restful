import express from 'express';
import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis le fichier .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import collectionRoutes from './routes/collectionRoutes';
import flashCardRoutes from './routes/flashCardRoutes';

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/flashcards', flashCardRoutes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
