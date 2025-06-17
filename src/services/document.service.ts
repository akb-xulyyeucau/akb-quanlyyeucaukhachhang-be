import { IDocument } from '../interfaces/document.interface';
import { IFile } from '../interfaces/document.interface';
import Document from '../models/document.model';
import fs from 'fs';
import path from 'path';
const uploadDir = path.join(__dirname, "..", "uploads");
export const uploadDocument = async (docData: IDocument) => {
  const {
    name,
    day,
    sender,
    files,
    isTrash
  } = docData;

  const newDoc = await Document.create({ name, day, sender, files , isTrash});

  if (!newDoc) throw new Error("Lỗi khi tải tài liệu");

  return newDoc;
};

export const getDocumentById = async (documentId : string) => {
  const doc = await Document.findById(documentId);
  if(!doc) throw new Error("Không tìm thấy tài liệu");
  return doc;
}

export const updateTrashStatus = async (documentId: string) => {
  // Đầu tiên tìm document để lấy trạng thái hiện tại
  const currentDoc = await Document.findById(documentId);
  if (!currentDoc) throw new Error("Không tìm thấy tài liệu");

  // Cập nhật với trạng thái ngược lại
  const doc = await Document.findByIdAndUpdate(
    documentId,
    { isTrash: !currentDoc.isTrash },
    { new: true }
  );
  
  return doc;
};

export const deleteDocument = async (documentId : string) => {
  const deleteDoc = await Document.findById(documentId);
  if (!deleteDoc) throw new Error("Không tìm thấy tài liệu");
   for(const file of deleteDoc.files){
      const filePath = path.join(uploadDir, path.basename(file.path));
      if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
        console.log("Xóa file thành công : " , filePath );
      }
    }
    const doc = await Document.findByIdAndDelete(documentId);
    return doc;
}

export const updateDocument = async (documentId: string, docData: IDocument) => {
  try {
    // Validate input
    if (!docData.name || !docData.day || !docData.sender || !docData.files) {
      throw new Error("Missing required fields");
    }

    // Lấy document cũ để có danh sách file cần xóa
    const selectDoc = await Document.findById(documentId);
    if (!selectDoc) {
      throw new Error("Không tìm thấy tài liệu");
    }

    // Lấy danh sách tất cả các file cũ cần xóa
    const oldFiles = selectDoc.files;
    const newFilePaths = docData.files.map(file => file.path);

    // Cập nhật document với dữ liệu mới hoàn toàn
    const updateDoc = await Document.findByIdAndUpdate(
      documentId, 
      {
        name: docData.name,
        day: docData.day,
        sender: docData.sender,
        files: docData.files,
        isTrash: docData.isTrash
      }, 
      { new: true }
    );

    if (!updateDoc) {
      throw new Error("Cập nhật tài liệu thất bại");
    }

    // Sau khi cập nhật DB thành công, xóa tất cả file cũ không còn trong danh sách mới
    for (const oldFile of oldFiles) {
      // Chỉ xóa file nếu nó không còn trong danh sách mới
      if (!newFilePaths.includes(oldFile.path)) {
        const filePath = path.join(uploadDir, path.basename(oldFile.path));
        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath);
            console.log("Đã xóa file cũ:", filePath);
          } catch (err) {
            console.error("Lỗi khi xóa file cũ:", filePath, err);
          }
        }
      }
    }

    return updateDoc;

  } catch (error) {
    throw error;
  }
};


 
 