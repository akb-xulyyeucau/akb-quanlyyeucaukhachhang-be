import { IDocument } from '../interfaces/document.interface';
import Document from '../models/document.model';

export const uploadDocument = async (docData: IDocument) => {
  const {
    name,
    day,
    sender,
    files
  } = docData;

  const newDoc = await Document.create({ name, day, sender, files });

  if (!newDoc) throw new Error("Lỗi khi tải tài liệu");

  return newDoc;
};

export const deleteDocument = async (documentId : string) => {
    const doc = await Document.findByIdAndDelete(documentId);
    if(!doc) throw new Error("Không xóa được tài liệu");
    return doc;
}
 