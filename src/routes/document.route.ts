import express from 'express';
import {uploadMultiple } from '../middlewares/upload.middleware';
import {
  uploadDocumentController,
  updateTrashStatusController,
  getDocumentByIdController,
  downloadFileController,
  deleteDocumentController,
  updateDocumentController,
  getUploadedFiles
} from '../controllers/document.controller';
import { protect } from '../middlewares/auth.middleware';
const router = express.Router();

router.use(protect);

router.post("/upload", uploadMultiple, uploadDocumentController);
router.get("/download/:filename", downloadFileController);
router.patch("/trash/:documentId", updateTrashStatusController);
router.get("/:documentId", getDocumentByIdController);
router.delete("/:documentId", deleteDocumentController);
router.put("/:documentId", uploadMultiple, updateDocumentController);
router.get("/uploads", getUploadedFiles);

export default router;