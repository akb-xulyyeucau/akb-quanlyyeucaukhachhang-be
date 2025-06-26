import { ObjectId } from "mongoose";

export interface IFeedBack {
    projectId : ObjectId,
    customerId : ObjectId,
    rating : string,
    comment : string,
    suggest : string
}