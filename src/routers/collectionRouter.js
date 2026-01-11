import { Router } from 'express';
import { createCollection, getCollection, listCollections, searchPublicCollections,updateCollection, deleteCollection } from '../controllers/collectionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateBody, validateParams } from '../middlewares/validation.js';
import { collectionIdSchema, createCollectionSchema, updateCollectionSchema } from '../models/collectionModel.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listCollections);
router.post('/', validateBody(createCollectionSchema), createCollection);
router.get('/search', searchPublicCollections);
router.get('/:collectionId', validateParams(collectionIdSchema),getCollection);
// router.put('/:collectionId', validateBody(updateCollectionSchema), validateParams(collectionIdSchema), updateCollection);
router.patch('/:collectionId', validateBody(updateCollectionSchema), validateParams(collectionIdSchema), updateCollection);
router.delete('/:collectionId', validateParams(collectionIdSchema), deleteCollection);

export default router;
