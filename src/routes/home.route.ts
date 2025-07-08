import express from 'express';
import { adminStatisticController, customerStatisticController } from '../controllers/home.controller';
import {protect}  from '../middlewares/auth.middleware';
const router = express.Router();

router.get('/admin-statistic', protect, adminStatisticController);
router.get('/customer-statistic', protect, customerStatisticController);

export default router;