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


