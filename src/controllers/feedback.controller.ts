import { IFeedBack } from '../interfaces/feedback.interface';
import Feedback from '../models/feedback.model';
import {
    createFeedback,
    getFeedbackInProject,
    updateFeedback,
    deleteFeedback
} from '../services/feedback.service';
import { Request, Response } from 'express';
import { queueMail, EmailTemplates } from '../mails/mail';
import { IUserDocument } from '../interfaces/user.interface';
import Project from '../models/project.model';

export const createFeedbackController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        
        const {
            projectId, customerId, rating, comment, suggest
        }: IFeedBack = req.body;
        
        const feedbackData: IFeedBack = {
            projectId, customerId, rating, comment, suggest
        }
        const feedback = await createFeedback(req, feedbackData);

        // Gửi mail thông báo khi có feedback mới
        const project = await Project.findById(projectId)
            .populate('pm') // Populate PM để lấy email
            .populate('customer'); // Populate customer để lấy thông tin dự án

        if (project) {
            // Gửi mail cho PM
            if ((project.pm as any).email) {
                await queueMail(
                    {
                        to: (project.pm as any).email,
                        ...EmailTemplates.FEEDBACK_RECEIVED(project.name, Number(rating), comment),
                        priority: 2 // Ưu tiên trung bình cho thông báo feedback
                    },
                    userId,
                    req
                );
            }
        }

        res.status(201).json({
            success: true,
            message: req.t('feedback.create.success', {ns: 'feedback'}),
            data: feedback
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const getFeedbackInProjectController = async (req : Request , res : Response) => {
    try {
        const {projectId} = req.params;
        const feedbacks = await getFeedbackInProject(req , projectId);
        res.status(200).json({
            success : true,
            message : req.t('feedback.getAll.success' , {ns : 'feedback'}),
            data : feedbacks
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message,
        })
    }
}

export const updateFeedbackCotroller = async (req : Request , res: Response)=> {
    try {
        const {feedbackId} = req.params;
        const {
            projectId, customerId , rating, comment , suggest
        } = req.body;
        const feeedbackData : IFeedBack = {
             projectId, customerId,  rating , comment , suggest
        }
        const newFeedback  = await updateFeedback(req , feedbackId , feeedbackData)
        res.status(200).json({
            success : true,
            message : req.t('feedback.update.success' , {ns:'feedback'}),
            data : newFeedback
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const deleteFeedbackController = async (req : Request , res : Response)=> {
    try {
        const {feedbackId} = req.params;
        const del = await deleteFeedback(req , feedbackId);
        res.status(200).json({
            success : true,
            message : req.t('feedback.del.success' , {ns : 'feedback'}),
            data : del
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}