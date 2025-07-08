import { IPhase } from '../interfaces/phase.interface';
import {
    getPhase,
    getPhaseByProjectId,
    createPhase,
    deletePhase,
    updatePhase,
} from '../services/phase.service';
import { Request, Response } from 'express';
import { queueMail, EmailTemplates } from '../utils/mail.util';
import { IUserDocument } from '../interfaces/user.interface';
import Project from '../models/project.model';
import Customer from '../models/customer.model';

export const getPhaseController = async (req : Request , res : Response) => {
    try {
        const phase = await getPhase(req);
        res.status(200).json({
            success : true,
            message : req.t('getPhase.success' , {ns : 'phase'}),
            data : phase
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getPhaseByProjectIdController = async (req : Request , res : Response) => {
    try {
        const {projectId} = req.params;
        const phase = await getPhaseByProjectId(req , projectId);
        const userId = req.user?._id;
        console.log('User ID:', userId);
        res.status(200).json({
            success : true,
            message : req.t('getPhase.success' , {ns : 'phase'}),
            data : phase
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const createPhaseController = async (req : Request , res : Response) => {
    try {
        const {projectId , name , phases , currentPhase} = req.body
        const phaseData : IPhase = {
            projectId : projectId,
            name : name,
            phases: phases,
            currentPhase,
        };
        const newPhase = await createPhase(req, phaseData);
        res.status(201).json({
            success : true,
            message : req.t('createPhase.success' , {ns : 'phase'}),
            data : newPhase
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const updatePhaseController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        const {phaseId} = req.params;
        const {projectId, name, phases, currentPhase} = req.body;
        const updateData: IPhase = {
            projectId,
            name,
            phases,
            currentPhase,
        }
        const updatedPhase = await updatePhase(req, phaseId, updateData);

        // Gửi mail thông báo khi chuyển phase
        const project = await Project.findById(projectId).populate('customer');
        if (project && (project.customer as any).emailContact) {
            await queueMail(
                {
                    to: (project.customer as any).emailContact,
                    ...EmailTemplates.PHASE_CHANGED(project.name, currentPhase),
                    priority: 2 // Ưu tiên trung bình cho thông báo chuyển phase
                },
                userId,
                req
            );
        }

        res.status(200).json({
            success: true,
            message: req.t('updatePhase.success', {ns: 'phase'}),
            data: updatedPhase
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const deletePhaseController = async (req : Request , res : Response) => {
    try {
        const {phaseId} = req.params;
        const deleted = await deletePhase(req, phaseId);
        res.status(200).json({
            success : true,
            message : req.t('deletePhase.success' , {ns : 'phase'}),
            data : deleted 
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        });
    }
}