import multer from "multer";
import path from "path";
import fs from "fs";
// Trỏ tới thư mục uploads bên trong src
const uploadDir = path.join(__dirname, "..", "uploads");
// Tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Ensure the original filename is properly decoded
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalName);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    } catch (error) {
      cb(error as Error, '');
    }
  },
});

const multerUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file PDF, DOCX hoặc XLSX"));
    }
  },
});

export const uploadMultiple = multerUpload.array("files", 10); // cho phép tối đa 10 files
