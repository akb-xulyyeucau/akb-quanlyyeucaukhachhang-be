import express from 'express';
import {uploadMultiple } from '../middlewares/upload.middleware';
import {uploadDocumentController} from '../controllers/document.controller';

const router = express.Router();
router.post("/upload" , uploadMultiple, uploadDocumentController);
export default router;