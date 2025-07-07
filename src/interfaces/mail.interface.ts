import { ObjectId } from "mongoose";

export interface IMailConfig {
    serviceName : string;
    host : string;
    encryptMethod : string;
    port : number;
    user : string;
    pass : string;
    secure : boolean;
    senderName : string;
    createdAt : Date;
    createdBy : string | ObjectId;
    isActive : boolean

}

export interface IMailQueue {
    to : string;
    subject : string;
    templateName : string;
    cc? : string[];
    bcc? : string[];
    isSend : boolean;
    status : 'pending' | 'success' | 'failed';
    errorMessage? : string;    
    createdBy : string | ObjectId;
    sendAt : Date;
    retryCount : number,
}