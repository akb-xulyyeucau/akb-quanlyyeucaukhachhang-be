import { ObjectId } from "mongoose";

export interface IPhase {
    projectId: ObjectId,
    name : string, 
    phases : Array<IPhaseItem>
    currentPhase : number
}

export interface IPhaseItem {
    name: string,
    order: number,
    description: string,
    day : Date
}