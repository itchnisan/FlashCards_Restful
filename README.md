# 📚 API Flashcards – Projet R5.05

## 1.Objectif du projet

Cette API REST a pour objectif de permettre la **création et la gestion de flashcards** afin d’aider à la révision via un backend structuré et sécurisé.

Le projet est réalisé dans le cadre de la **R5.05 – Projet de groupe (BUT Informatique)** et se concentre uniquement sur la **conception backend**.


###  Initialisation du projet

npm init -y

###  Installation des dépendances backend
npm install

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

### 🛠️ Technologies utilisées

- **Node.js**
- **Express**
- **SQLite** (`@libsql/client`)
- **Drizzle ORM**
- **JWT** (`jsonwebtoken`)
- **bcrypt**
- **zod**
- **dotenv**
- **nodemon**

### 3.Configuration des variables d’environnement

Créer un fichier `.env` à la racine du projet :

```env
JWT_SECRET=super_secret_key
```

### 4.Lancer l’API en développement

```bash
npm run dev
```


###  Authentification

L’API utilise des **JSON Web Tokens (JWT)**.

Les routes protégées nécessitent le header suivant :

```http
Authorization: Bearer <token>
```


##  Endpoints de l’API



##  Authentification

###  Inscription
- **POST** `/auth/register`
- **Accès** : Public

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@email.com",
  "password": "password123"
}
```


### Connexion
- **POST** `/auth/login`
- **Accès** : Public

```json
{
  "email": "john.doe@email.com",
  "password": "password123"
}
```



##  Collections

###  Créer une collection
- **POST** `/collections`
- **Accès** : Authentifié

```json
{
  "titre": "Mathématiques",
  "description": "Révisions des formules",
  "visibility": "public"
}
```


###  Consulter une collection
- **GET** `/collections/:collectionId`
- **Accès** : Authentifié  
 Une collection privée est accessible uniquement par son propriétaire.


###  Lister ses collections
- **GET** `/collections`
- **Accès** : Authentifié

---

###  Rechercher des collections publiques
- **GET** `/collections/search?title=math`
- **Accès** : Authentifié

---

###  Modifier une collection
- **PUT** `/collections/:collectionId`
- **Accès** : Propriétaire

---

###  Supprimer une collection
- **DELETE** `/collections/:collectionId`
- **Accès** : Propriétaire  
➡ Supprime également les flashcards associées

---

##  Questions (Flashcards)

Les flashcards sont appelées **questions** dans le code.

---

###  Lister toutes les questions
- **GET** `/questions`
- **Accès** : Authentifié
- **Description** : Retourne toutes les questions, triées par date de création décroissante

---

###  Créer une question
- **POST** `/questions`
- **Accès** : Authentifié

```json
{
  "questionText": "Qu'est-ce qu'une API REST ?",
  "answer": "Une architecture basée sur HTTP",
  "difficulty": 2
}
```

---

###  Consulter une question
- **GET** `/questions/:id`
- **Accès** : Authentifié

---

###  Supprimer une question
- **DELETE** `/questions/:id`
- **Accès** : Propriétaire  
⚠️ Seul l’utilisateur ayant créé la question peut la supprimer.

---

##  Sécurité & règles d’accès

- Toutes les routes (hors `/auth/*`) sont protégées par JWT
- Un utilisateur ne peut modifier ou supprimer **que ses propres données**
- Mots de passe hashés avec **bcrypt**
- Données validées avec **zod**

---

##  Modèle de données

### `users`
- `id`
- `firstName`
- `lastName`
- `email`
- `password`
- `created_at`

### `collections`
- `id`
- `titre`
- `description`
- `visibility`
- `owner_id` → users.id

### `questions`
- `id`
- `questionText`
- `answer`
- `difficulty`
- `createdBy` → users.id
- `created_at`

---

##  Structure du projet

```
src/
 ├─ routes/
 ├─ controllers/
 ├─ middlewares/
 ├─ db/
 ├─ models/
 └─ app.js
```

---

##  Conformité au sujet

✔ Node.js + Express  
✔ SQLite + Drizzle  
✔ JWT + bcrypt  
✔ zod  
✔ Architecture modulaire  
✔ Documentation complète  

---

##  Projet R5.05 – BUT Informatique  
Université de Caen – 2025

