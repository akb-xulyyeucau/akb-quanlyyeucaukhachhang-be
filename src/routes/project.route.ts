import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { 
 getAllProjectController,
 createProjectController,
 updateProjectByIdController,
 deleteProjectByIdController,
 getProjectRequestController,
 getProjectByIdController,
 activeProjectController
} from '../controllers/project.controller';
import {  protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();
router.use(protect);
router.use(authorize('admin' , 'pm' , 'guest'));

router.get('/' , expressAsyncHandler(getAllProjectController));
router.get('/request', expressAsyncHandler(getProjectRequestController));
router.get('/:pId', expressAsyncHandler(getProjectByIdController));
router.post('/', expressAsyncHandler(createProjectController));
router.patch('/active/:pId' , expressAsyncHandler(activeProjectController));
router.put('/:pId' , expressAsyncHandler(updateProjectByIdController));
router.delete('/:pId' , expressAsyncHandler(deleteProjectByIdController));

export default router;