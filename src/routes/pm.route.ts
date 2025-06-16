import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { protect, authorize } from '../middlewares/auth.middleware';
import { 
    createPMController , 
    getAllPMController , 
    getPMByUserIdController , 
    updatePMByIdController , 
    deletePMByIdController,
    deletePMByUserIdController,
    autoSearchPMsController
} from '../controllers/pm.controller';
const router = express.Router();


router.post('/' , protect, authorize('admin'), expressAsyncHandler(createPMController));
router.get('/' , protect, authorize('admin'), expressAsyncHandler(getAllPMController));
router.get('/auto-search' , protect, expressAsyncHandler(autoSearchPMsController));
router.get('/:userId' , protect, authorize('admin'), expressAsyncHandler(getPMByUserIdController));
router.put('/:id' , protect, authorize('admin'), expressAsyncHandler(updatePMByIdController));
router.delete('/:id' , protect, authorize('admin'), expressAsyncHandler(deletePMByIdController));
router.delete('/user/:id' , protect , authorize('admin') , expressAsyncHandler(deletePMByUserIdController));

export default router;
