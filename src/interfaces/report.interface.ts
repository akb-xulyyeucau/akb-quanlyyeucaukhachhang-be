import {ObjectId} from 'mongoose'
import { IDocument, IFile } from './document.interface'

export interface IReport {
    mainContent : string;
    day : Date;
    sender : ObjectId;
    projectId : ObjectId;
    subContent : ISubContent[];
    subContentCount?: number;
    // createdAt : Date // Optional field for response only
}

export interface ISubContent {
    contentName : string;
    files : IFile[];
}

