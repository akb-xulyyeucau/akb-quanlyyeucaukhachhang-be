import express from 'express';
import {uploadMultiple } from '../middlewares/upload.middleware';
import {
  uploadDocumentController,
  updateTrashStatusController
} from '../controllers/document.controller';

const router = express.Router();
router.post("/upload" , uploadMultiple, uploadDocumentController);
router.patch("/trash/:documentId", updateTrashStatusController);
export default router;