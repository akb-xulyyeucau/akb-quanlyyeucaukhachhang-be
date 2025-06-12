import express from 'express';
import {uploadMultiple } from '../middlewares/upload.middleware';
import {
  uploadDocumentController,
  updateTrashStatusController,
  getDocumentByIdController
} from '../controllers/document.controller';
import { protect } from '../middlewares/auth.middleware';
const router = express.Router();

router.use(protect);

router.post("/upload" , uploadMultiple, uploadDocumentController);
router.get("/:documentId", getDocumentByIdController);
router.patch("/trash/:documentId", updateTrashStatusController);
export default router;