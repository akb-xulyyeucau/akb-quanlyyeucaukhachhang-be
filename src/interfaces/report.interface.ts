import {ObjectId} from 'mongoose'
import { IDocument } from './document.interface'
export interface IReport {
    name : string,
    alias : string,
    content : string,
    projectId : ObjectId,
    documentIds : Array<IDocument>,
    day : Date,
    sender : ObjectId
}