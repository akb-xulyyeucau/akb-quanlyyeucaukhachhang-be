import mongoose, { Model, Schema } from 'mongoose';
import { IDocument, IFile } from '../interfaces/document.interface';

const fileSchema = new mongoose.Schema<IFile>({
    originalName :{type : String},
    path : {type : String , required : true}, 
    size : {type : Number},
    type: {type : String},
})

const documentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  day: { type: Date, required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  files: { type: [fileSchema], required: true }
}, {
  timestamps: true // Tùy chọn nếu bạn muốn track createdAt / updatedAt
});

const Document : Model<IDocument> = mongoose.model<IDocument>("Document", documentSchema);
export default Document;