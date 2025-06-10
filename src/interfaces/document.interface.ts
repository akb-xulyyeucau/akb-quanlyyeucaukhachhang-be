import { ObjectId } from "mongoose";

export interface IDocument {
   name : string,
   day: Date,
   files : Array<IFile>,
   sender : ObjectId
}

export interface IFile {
    originalName : string,
    path: string,
    size: number ,
    type : string
}
