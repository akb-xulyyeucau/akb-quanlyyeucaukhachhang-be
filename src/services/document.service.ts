import { IDocument } from '../interfaces/document.interface';
import Document from '../models/document.model';

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

export const updateTrashStatus = async (documentId: string) => {
  const doc = await Document.findByIdAndUpdate(
    documentId,
    { isTrash: true },
    { new: true }
  );
  if (!doc) throw new Error("Không tìm thấy tài liệu");
  return doc;
};

export const deleteDocument = async (documentId : string) => {
    const doc = await Document.findByIdAndDelete(documentId);
    if(!doc) throw new Error("Không xóa được tài liệu");
    return doc;
}
 