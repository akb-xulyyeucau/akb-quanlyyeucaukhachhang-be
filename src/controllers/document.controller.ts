import { Request, Response, RequestHandler } from 'express';
import { uploadDocument, deleteDocument, updateTrashStatus, getDocumentById } from '../services/document.service';
import { IFile } from '../interfaces/document.interface';
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
            message : "Xóa tài liệu thành công",
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
