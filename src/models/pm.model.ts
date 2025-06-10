import mongoose, { Model } from "mongoose";
import { IPM } from "../interfaces/pm.interface";

const pmSchema = new mongoose.Schema<IPM>({
    alias : {type : String, required : true, unique : true},
    userId : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true, unique : true},
    name : {type : String, required : true},
    emailContact : {type : String, required : true, unique : true},
    phoneContact : {type : String, required : true},
    dob : {type : Date},
}, {timestamps : true})

const PM : Model<IPM> = mongoose.model<IPM>("PM", pmSchema);

export default PM;