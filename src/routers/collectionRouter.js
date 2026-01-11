import { Router } from 'express';
import { createCollection, getCollection, listCollections, searchPublicCollections,updateCollection, deleteCollection } from '../controllers/collectionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validation.js';
import { createCollectionSchema } from '../models/collectionModel.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listCollections);
router.post('/', validateBody(createCollectionSchema), createCollection);
router.get('/search', searchPublicCollections);
router.get('/:collectionId', ()=>{}, getCollection);
router.put('/:collectionId', ()=>{}, updateCollection);
router.delete('/:collectionId', ()=>{}, deleteCollection);

export default router;
