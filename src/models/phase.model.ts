import mongoose, { Model, Schema }  from "mongoose";
import { IPhase, IPhaseItem } from "../interfaces/phase.interface";

const phaseItemSchema = new mongoose.Schema<IPhaseItem>({
    name : {type : String },
    order : {type : Number },
    description : {type : String },
});

const phaseSchema = new Schema<IPhase>({
    name : {type : String},
    projectId : {type : mongoose.Schema.Types.ObjectId , ref : 'Project', required : true , unique : true},
    phases : {type : [phaseItemSchema] , required : true },
    currentPhase : {type : Number }
} , {timestamps : true});

const Phase : Model<IPhase> = mongoose.model<IPhase>('Phase' , phaseSchema);
export default Phase;