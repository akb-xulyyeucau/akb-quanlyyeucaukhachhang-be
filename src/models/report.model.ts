import mongoose , {Model , Schema} from "mongoose";
import {  IReport, ISubContent } from "../interfaces/report.interface";
import { IFile } from "../interfaces/document.interface";

const fileSchema = new mongoose.Schema<IFile>({
    originalName: { type: String },
    path: { type: String, required: true },
    size: { type: Number },
    type: { type: String },
});

const subContentSchema = new mongoose.Schema<ISubContent>({
    contentName : { type: String, required: true },
    files: { type: [fileSchema], required: true },
})

const reportSchema = new Schema<IReport>({
    mainContent: { type: String, required: true },
    day: { type: Date, default: Date.now },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    subContent: { type: [subContentSchema], required: true }
}, {
    timestamps: true
});

const Report : Model<IReport> = mongoose.model<IReport>("Report", reportSchema);

export default Report;