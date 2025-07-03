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
}