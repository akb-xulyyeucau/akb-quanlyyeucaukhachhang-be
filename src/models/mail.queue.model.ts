import mongoose , {model, Model , Schema} from 'mongoose';
import {IMailQueue} from '../interfaces/mail.interface';

const mailQueueSchema = new mongoose.Schema<IMailQueue>({
    to : {type : String , required : true},
    subject : {type : String , required : true},
    templateName : {type : String , required : true},
    cc : {type : Array , default :[]},
    bcc : {type : Array , default : []},
    isSend : {type : Boolean , default : false},
    status : {type : String , enum : ['pending' , 'success' , 'failed'] , default : 'pending'},
    errorMessage : {type : String , default : ''},
    createdBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User' , required : true},
    sendAt : {type : Date , default : Date.now()},
    retryCount : {type : Number , default : 0},
})

const MailQueue = model<IMailQueue>('MailQueue' , mailQueueSchema);

export default MailQueue;