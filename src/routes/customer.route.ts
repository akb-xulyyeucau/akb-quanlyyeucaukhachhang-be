import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { protect, authorize } from '../middlewares/auth.middleware';
import { 
    createCustomerCotroller , 
    getAllCustomerController , 
    getCustomerByUserIdController , 
    updateCustomerByIdController , 
    deleteCustomerByIdController,
    deleteCustomerByUserIdController,
    getCustomerPagnitonController
} from '../controllers/customer.controller';
const router = express.Router();

router.use(protect);
router.post('/', authorize('admin'), expressAsyncHandler(createCustomerCotroller));
router.get('/', authorize('admin'), expressAsyncHandler(getAllCustomerController));
router.get('/search', authorize('admin' ), expressAsyncHandler(getCustomerPagnitonController));
router.get('/:userId', authorize('admin'), expressAsyncHandler(getCustomerByUserIdController));
router.put('/:id' , authorize('admin'), expressAsyncHandler(updateCustomerByIdController));
router.delete('/:id', authorize('admin'), expressAsyncHandler(deleteCustomerByIdController));
router.delete('/user/:id', authorize('admin') , expressAsyncHandler(deleteCustomerByUserIdController));
export default router;
