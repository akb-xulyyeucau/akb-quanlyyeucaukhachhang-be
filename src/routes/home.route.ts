import express from 'express';
import { adminStatisticController } from '../controllers/home.controller';
import {protect}  from '../middlewares/auth.middleware';
const router = express.Router();

router.get('/admin-statistic' , protect , adminStatisticController);

export default router;