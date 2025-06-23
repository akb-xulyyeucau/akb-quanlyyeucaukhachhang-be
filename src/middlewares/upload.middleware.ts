import multer from "multer";
import path from "path";
import fs from "fs";

// Trỏ tới thư mục uploads bên trong src
const uploadDir = path.join(__dirname, "..", "uploads");

// Tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Định nghĩa type cho các loại file được phép
type AllowedMimeTypes = 
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'image/jpeg'
  | 'image/png'
  | 'image/jpg';

// Định nghĩa các loại file được phép upload
const ALLOWED_FILE_TYPES: Record<AllowedMimeTypes, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/jpg': '.jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Lấy extension từ mimetype để đảm bảo đúng định dạng
      const ext = ALLOWED_FILE_TYPES[file.mimetype as AllowedMimeTypes] || path.extname(file.originalname);
      // Tạo tên file mới với định dạng: files-timestamp-random.extension
      cb(null, `files-${uniqueSuffix}${ext}`);
    } catch (error) {
      cb(error as Error, '');
    }
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Kiểm tra xem file type có được chấp nhận không
  if (ALLOWED_FILE_TYPES[file.mimetype as AllowedMimeTypes]) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ file PDF, DOCX, XLSX, JPG, JPEG hoặc PNG"));
  }
};

const multerUpload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter
});

export const uploadMultiple = multerUpload.array("files", 10); // cho phép tối đa 10 files
