import express from 'express';
import {
    createFeedbackController,
    getFeedbackInProjectController,
    updateFeedbackCotroller,
    deleteFeedbackController
} from '../controllers/feedback.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

// Tạo feedback mới
router.post('/', createFeedbackController);

// Lấy feedback theo project
router.get('/project/:projectId', getFeedbackInProjectController);

// Cập nhật feedback
router.put('/:feedbackId', updateFeedbackCotroller);

// Xóa feedback
router.delete('/:feedbackId', deleteFeedbackController);

export default router;