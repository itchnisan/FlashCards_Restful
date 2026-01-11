import { Router } from 'express';
import { createCollection, getCollection, listCollections, searchPublicCollections,updateCollection, deleteCollection } from '../controllers/collectionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', ()=>{}, createCollection);
router.get('/search', searchPublicCollections);
router.get('/:collectionId', ()=>{}, getCollection);
router.get('/', listCollections);
router.put('/:collectionId', ()=>{}, updateCollection);
router.delete('/:collectionId', ()=>{}, deleteCollection);

export default router;
