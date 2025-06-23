import { Request, Response, RequestHandler } from 'express';
import { uploadDocument, deleteDocument, updateTrashStatus, getDocumentById, updateDocument  } from '../services/document.service';
import { IFile, IDocument } from '../interfaces/document.interface';
import path from 'path';
import fs from 'fs';

export const uploadDocumentController = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new Error("Không có file nào được tải lên");
    const { name, day, sender } = req.body;
    
    // Xây dựng mảng files để lưu vào DB
    const fileInfos: IFile[] = files.map((file) => ({
      originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      path: file.filename,
      size: file.size,
      type: file.mimetype,
    }));

    const newDoc = await uploadDocument({
      name,
      day,
      sender,
      files: fileInfos,
      isTrash: true
    });

    res.status(201).json({
      success: true,
      message: "Upload tài liệu thành công",
      data: newDoc,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDocumentByIdController = async (req : Request , res : Response) => {
  try {
    const {documentId} = req.params;
    const documents = await getDocumentById(documentId);
    res.status(200).json({
      success : true,
      message : "Lấy tài liệu thành công",
      data : documents
    })
  } catch ( error : any) {
    res.status(400).json({
      success : false,
      message : error.message
    })
  }
}

export const updateTrashStatusController = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const updatedDoc = await updateTrashStatus(documentId);
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: updatedDoc,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDocumentController = async (req : Request , res: Response)=>{
    try {
        const {documentId} = req.params;
        const doc = await deleteDocument(documentId);
        res.status(200).json({
            success : true,
            message : req.t("delete.success", {ns : "document"}),
            data : doc
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const downloadFileController: RequestHandler = (req, res): void => {
  try {
    const { filename } = req.params;
    const uploadDir = path.join(__dirname, "..", "uploads");
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: "File không tồn tại"
      });
      return;
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: "Lỗi khi tải file"
        });
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateDocumentController = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { name, day, sender } = req.body;
    const existingFiles = JSON.parse(req.body.existingFiles || '[]');
    const files = req.files as Express.Multer.File[];

    // 0. Kiểm tra document tồn tại
    const existingDoc = await getDocumentById(documentId);
    if (!existingDoc) {
      throw new Error("Không tìm thấy tài liệu");
    }

    // 1. Xử lý files mới nếu có
    let updatedFiles = [...existingFiles]; // Bắt đầu với các file cũ còn lại

    if (files && files.length > 0) {
      // Thêm các file mới vào
      const newFileInfos: IFile[] = files.map((file) => ({
        originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        path: file.filename,
        size: file.size,
        type: file.mimetype,
      }));
      updatedFiles = [...updatedFiles, ...newFileInfos];
    }

    // 2. Tạo document data mới
    const docData: IDocument = {
      name,
      day,
      files: updatedFiles,
      isTrash: false,
      sender: existingDoc.sender // Giữ nguyên sender từ document cũ
    };

    const updatedDoc = await updateDocument(documentId, docData);
    
    res.status(200).json({
      success: true,
      message: "Cập nhật tài liệu thành công",
      data: updatedDoc
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUploadedFiles = async (req: Request, res: Response) => {
  try {
    const uploadsDir = path.join(__dirname, "../uploads");
    
    // Read all files from the uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Get file details
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const extension = path.extname(file).toLowerCase();
      
      return {
        name: file,
        path: `/uploads/${file}`, // URL path to access the file
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        type: extension === '.pdf' ? 'pdf' : 
              ['.jpg', '.jpeg', '.png', '.gif'].includes(extension) ? 'image' : 
              'other'
      };
    });

    // Filter only PDF and image files if specified in query
    const fileType = req.query.type as string;
    let filteredFiles = fileDetails;
    if (fileType === 'pdf') {
      filteredFiles = fileDetails.filter(file => file.type === 'pdf');
    } else if (fileType === 'image') {
      filteredFiles = fileDetails.filter(file => file.type === 'image');
    }

    res.status(200).json({
      success: true,
      data: filteredFiles
    });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    res.status(400).json({
      success: false,
      message: 'Error reading uploaded files'
    });
  }
};


