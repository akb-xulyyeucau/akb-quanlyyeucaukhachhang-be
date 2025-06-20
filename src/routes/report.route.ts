import express from 'express';
import { createReportController, getProjectReportsController, getReportDetailController , deleteReportController} from '../controllers/report.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Create new report
router.post('/create', protect, createReportController);

// Get all reports for a project
router.get('/project/:projectId', protect, getProjectReportsController);

// Get report detail
router.get('/:reportId', protect, getReportDetailController);


// Delete report (if needed, you can uncomment this route)
router.delete('/:reportId',  protect , deleteReportController);

export default router; 