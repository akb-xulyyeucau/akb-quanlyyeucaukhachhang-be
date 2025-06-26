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
    getCustomerPagnitonController,
    autoSearchCustomersController,
    customerStatisticController
} from '../controllers/customer.controller';
const router = express.Router();

router.use(protect);

// Route tĩnh đặt trước
router.post('/statistic', authorize('admin'), expressAsyncHandler(customerStatisticController));
router.get('/auto-search', expressAsyncHandler(autoSearchCustomersController));
router.get('/search', authorize('admin', 'pm'), expressAsyncHandler(getCustomerPagnitonController));
router.get('/', authorize('admin', 'pm'), expressAsyncHandler(getAllCustomerController));
router.post('/', authorize('admin'), expressAsyncHandler(createCustomerCotroller));

// Route động đặt sau
router.get('/:userId', authorize('admin', 'pm'), expressAsyncHandler(getCustomerByUserIdController));
router.put('/:id', authorize('admin', 'pm'), expressAsyncHandler(updateCustomerByIdController));
router.delete('/:id', authorize('admin', 'pm'), expressAsyncHandler(deleteCustomerByIdController));
router.delete('/user/:id', authorize('admin', 'pm'), expressAsyncHandler(deleteCustomerByUserIdController));

export default router;