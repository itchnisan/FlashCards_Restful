import { Router } from 'express';
import { getUserInfo, getUser, deleteUser, getUsers } from '../controllers/usersController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateParams } from '../middlewares/validation.js';
import { userIdSchema } from '../models/userModel.js';

const router = Router();

// router.use(authenticateAdminToken);
router.use(authMiddleware);

router.get('/all', getUsers);
router.get('/', getUserInfo);

router.get('/:userId', validateParams(userIdSchema), getUser);
router.delete('/:userId', validateParams(userIdSchema), deleteUser);



export default router;