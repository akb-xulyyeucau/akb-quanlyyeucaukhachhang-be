import mongoose, { Model } from "mongoose";
import { IProject } from "../interfaces/project.interface";

const projectSchema = new mongoose.Schema<IProject>({
    alias : {type :String , required : true , unique : true },
    name : {type : String , required : true},
    pm : {type : mongoose.Schema.Types.ObjectId , ref: "PM"},
    customer :{type : mongoose.Schema.Types.ObjectId , ref: "Customer" , required : true},
    status : {type : String , enum : ["Chưa kích hoạt" , "Đang hoạt động" , "Đã hoàn thành"] , default : "Chưa kích hoạt"},
    day : {type : Date , required : true},
    isActive: { type: Boolean, default: false },
    documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" , default :"Không có tài liệu" }]
});

const Project : Model<IProject> = mongoose.model<IProject>("Project" , projectSchema); 
export default Project;