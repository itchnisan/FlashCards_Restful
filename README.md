1. Initialisation du projet

npm init -y

2. Installation des dépendances backend

npm install express @libsql/client drizzle-orm zod bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon


express : framework pour créer l’API.

@libsql/client : pour la connexion à SQLite.

drizzle-orm : ORM pour interagir avec la base de données.

zod : validation des données.

bcryptjs : pour le hachage des mots de passe.

jsonwebtoken : pour la gestion des JWT.

dotenv : pour gérer les variables d’environnement.

nodemon : pour recharger automatiquement l'API pendant le développement.