import { ObjectId } from "mongoose";

export interface IProject {
   alias : string,
   name : string,
   pm : ObjectId,
   customer : ObjectId,
   status : string,
   day : Date,
   isActive : boolean,
   documentIds : Array<ObjectId>
}

export interface IUserSender {
   _id: string;
   email: string;
   alias: string;
   role: 'pm' | 'guest';
   name?: string; // ta sẽ gán sau
 }
 
export interface IDocumentPopulated {
   _id: string;
   sender: IUserSender;
 }
 
 export interface IProjectPopulated extends Document {
   _id: string;
   name: string;
   pm: {
     name: string;
     emailContact: string;
   };
   customer: {
     _id: any;
     name: string;
     emailContact: string;
   };
   documentIds: IDocumentPopulated[];
 }
 