import { Router } from 'express';
import { createCollection, getCollection, listCollections, searchPublicCollections, updateCollection, deleteCollection } from '../controllers/collectionController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createCollection);
router.get('/:collectionId', authMiddleware, getCollection);
router.get('/', authMiddleware, listCollections);
router.get('/search', authMiddleware, searchPublicCollections);
router.put('/:collectionId', authMiddleware, updateCollection);
router.delete('/:collectionId', authMiddleware, deleteCollection);

export default router;
