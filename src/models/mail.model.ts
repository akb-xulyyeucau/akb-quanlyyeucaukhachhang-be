import mongoose, { Schema, model } from 'mongoose';
import { IMailConfig } from '../interfaces/mail.interface';

const mailConfigSchema = new mongoose.Schema<IMailConfig>({
    serviceName : {type : String, required : true },
    host : {type : String, required : true },
    port : {type : Number, required : true },
    encryptMethod : {type : String, required : true , enum : ['SSL', 'TLS']},
    user : {type : String, required : true },
    pass : {type : String, required : true },
    secure : {type : Boolean, required : true },
    senderName : {type : String, required : true },
    createdAt : {type : Date, default : Date.now },
    createdBy : {type : Schema.Types.ObjectId, ref : 'User', required : true , unique : true },
})

const MailConfig = model<IMailConfig>('MailConfig', mailConfigSchema);

export default MailConfig;