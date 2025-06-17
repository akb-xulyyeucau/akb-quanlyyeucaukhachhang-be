import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { 
 getAllProjectController,
 createProjectController,
 updateProjectByIdController,
 deleteProjectByIdController,
 getProjectRequestController,
 getProjectByIdController,
 activeProjectController,
 getProjectByCustomerIdController,
 getProjectRequestByCustomerIdController,
 addDocumentToProjectController
} from '../controllers/project.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();
router.use(protect);
router.use(authorize('admin', 'pm', 'guest'));

// Route cụ thể trước
router.get('/request', expressAsyncHandler(getProjectRequestController));
router.get('/request/:cId', expressAsyncHandler(getProjectRequestByCustomerIdController));
router.get('/customer/:cId', expressAsyncHandler(getProjectByCustomerIdController));

// Thao tác cập nhật
router.patch('/add-document/:pId', expressAsyncHandler(addDocumentToProjectController));
router.post('/', expressAsyncHandler(createProjectController));
router.patch('/active/:pId', expressAsyncHandler(activeProjectController));
router.put('/:pId', expressAsyncHandler(updateProjectByIdController));
router.delete('/:pId', expressAsyncHandler(deleteProjectByIdController));

// Route tổng quát để cuối cùng
router.get('/:pId', expressAsyncHandler(getProjectByIdController));
router.get('/', expressAsyncHandler(getAllProjectController));

export default router;
