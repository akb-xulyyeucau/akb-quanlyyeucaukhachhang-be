import { IFeedBack } from '../interfaces/feedback.interface';
import Feedback from '../models/feedback.model';
import { Request } from 'express';

export const createFeedback = async (req : Request , feedbackData : IFeedBack) => {
    try {
        const newFeedback = await Feedback.create(feedbackData);
        if(!newFeedback) throw new Error(req.t('feedback.create.faild' , {ns : 'feeedback'}))
        return newFeedback;
    } catch (error : any) {
        throw new Error(error.message);
    }
}

export const getFeedbackInProject = async (req : Request , projectId : string) => {
    try {
        const feedbacks = await Feedback.find({projectId}).populate('customerId').sort({createdAt : -1});
        if(!feedbacks) throw new Error(req.t('feedback.getAll.faild', {ns : 'feedback'}));
        return feedbacks;
    } catch (error : any) {
        throw new Error(error.message);
    }
}

export const updateFeedback = async (req : Request , feedbackId : string , feedbackData : IFeedBack) => {
    try {
        const newFeedback = await Feedback.findByIdAndUpdate(feedbackId , feedbackData , {new : true});
        if(!newFeedback) throw new Error(req.t('feedback.update.faild' , {ns : 'feedback'}));
        return newFeedback;
    } catch (error : any) {
        throw new Error(error.message);
    }
}

export const deleteFeedback = async (req : Request , feedbackId : string)=>{
    try {
        const delFeedback = await Feedback.findByIdAndDelete(feedbackId);
        if(!delFeedback) throw new Error(req.t('feedback.delete.faild' , {ns :'feedback'}));
        return delFeedback;
    } catch (error : any) {
        throw new Error(error.message)
    }
}