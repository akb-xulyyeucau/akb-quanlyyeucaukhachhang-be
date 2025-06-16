import express from 'express';
import {uploadMultiple } from '../middlewares/upload.middleware';
import {
  uploadDocumentController,
  updateTrashStatusController,
  getDocumentByIdController,
  downloadFileController
} from '../controllers/document.controller';
import { protect } from '../middlewares/auth.middleware';
const router = express.Router();

router.use(protect);

router.post("/upload", uploadMultiple, uploadDocumentController);
router.get("/download/:filename", downloadFileController);
router.get("/:documentId", getDocumentByIdController);
router.patch("/trash/:documentId", updateTrashStatusController);

export default router;