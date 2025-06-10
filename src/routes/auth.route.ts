import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { 
    loginUserController, 
    refreshTokenController, 
    logoutController  
} from '../controllers/auth.controller';
import { verifyRefreshToken, protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Route đăng nhập

router.post('/login', expressAsyncHandler(loginUserController));
router.post('/refresh-token', verifyRefreshToken, expressAsyncHandler(refreshTokenController));
router.post('/logout', protect, expressAsyncHandler(logoutController));

export default router;