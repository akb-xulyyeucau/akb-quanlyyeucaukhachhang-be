import { Request, Response } from 'express';
import { uploadDocument , deleteDocument } from '../services/document.service';
import { IFile } from '../interfaces/document.interface';

export const uploadDocumentController = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new Error("Không có file nào được tải lên");
    const { name, day, sender } = req.body;
    // Xây dựng mảng files để lưu vào DB
    const fileInfos: IFile[] = files.map((file) => ({
      originalName: file.originalname,
      path: file.filename, // full path lưu trên server
      size: file.size,
      type: file.mimetype,
    }));
    const newDoc = await uploadDocument({
      name,
      day,
      sender,
      files: fileInfos,
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
