import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { protect, authorize } from '../middlewares/auth.middleware';

import { createPhaseController, deletePhaseController, getPhaseByProjectIdController, getPhaseController, updatePhaseController } from '../controllers/phase.controller';

const router = express.Router();

router.use(protect);

router.get('/' , expressAsyncHandler(getPhaseController));
router.post('/' , expressAsyncHandler(createPhaseController));
router.put('/:phaseId', expressAsyncHandler(updatePhaseController));
router.delete('/:phaseId' , expressAsyncHandler(deletePhaseController));
router.get('/project-phase/:projectId' , expressAsyncHandler(getPhaseByProjectIdController));

export default router;
