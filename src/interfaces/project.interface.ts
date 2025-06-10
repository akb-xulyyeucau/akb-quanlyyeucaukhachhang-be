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
