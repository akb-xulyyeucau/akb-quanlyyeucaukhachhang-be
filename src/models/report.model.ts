import mongoose , {Model , Schema} from "mongoose";
import { IReport } from "../interfaces/report.interface";


const reportSchema = new mongoose.Schema<IReport>({
    name : {type : String },
    alias : {type : String , unique : true},
    content : {type : String},
    projectId : {type : Schema.Types.ObjectId , ref : 'Project' },
    documentIds : [{type : Schema.Types.ObjectId , ref : 'Document'}],
    day : {type : Date , default : Date.now()},
    sender : {type : Schema.Types.ObjectId}
});

const Report : Model<IReport> = mongoose.model<IReport>("Report" , reportSchema);
export default Report;