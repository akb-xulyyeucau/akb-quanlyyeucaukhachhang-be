import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { 
 getAllProjectController,
 createProjectController,
 updateProjectByIdController,
 deleteProjectByIdController,
 getProjectRequestController
} from '../controllers/project.controller';
import {  protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();
router.use(protect);
router.use(authorize('admin' , 'pm'));

router.get('/' , expressAsyncHandler(getAllProjectController));
router.get('/request', expressAsyncHandler(getProjectRequestController));
router.post('/', expressAsyncHandler(createProjectController));
router.put('/:pId' , expressAsyncHandler(updateProjectByIdController));
router.delete('/:pId' , expressAsyncHandler(deleteProjectByIdController));

export default router;