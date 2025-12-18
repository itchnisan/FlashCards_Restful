import { Router } from 'express';
import { getUserInfo } from '../controllers/usersController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// router.use(authenticateAdminToken);

router.get('/', authMiddleware, getUserInfo);


export default router;