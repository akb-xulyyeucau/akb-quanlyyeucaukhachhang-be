import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { 
    createUserController, 
    getAllUserController, 
    getUserByIdController, 
    deleteUserByIdController, 
    udateUserByIdController,
    getUserController,
    updateUserActiveController,
    meController
} from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', protect, authorize('admin'), expressAsyncHandler(getAllUserController));
router.get('/search', protect, authorize('admin'), expressAsyncHandler(getUserController));
router.post('/', protect, authorize('admin'), expressAsyncHandler(createUserController));
router.get('/:id', protect, authorize('admin'), expressAsyncHandler(getUserByIdController));
router.put('/:id', protect, authorize('admin'), expressAsyncHandler(udateUserByIdController));
router.delete('/:id', protect, authorize('admin'), expressAsyncHandler(deleteUserByIdController));
router.patch('/active/:userId', protect, authorize('admin'), expressAsyncHandler(updateUserActiveController));
router.get('/me/:userId', expressAsyncHandler(meController));

export default router;