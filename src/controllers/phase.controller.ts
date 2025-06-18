import { IPhase } from '../interfaces/phase.interface';
import {
    getPhase,
    getPhaseByProjectId,
    createPhase,
    deletePhase,
    updatePhase,
} from '../services/phase.service';
import { Request, Response } from 'express';

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
        res.status(200).json({
            success : true,
            message : req.t('getPhase.success' , {ns : 'phase'}),
            data : phase
        })
    } catch (error : any) {
        res.status(400).json({
            success : true,
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

export const updatePhaseController = async (req : Request , res : Response) => {
    try {
        const {phaseId} = req.params;
        const {projectId , name , phases , currentPhase} = req.body;
        const updateData : IPhase =  {
            projectId : projectId,
            name : name,
            phases : phases,
            currentPhase,
        }
        const updatedPhase = await updatePhase(req , phaseId , updateData);
        res.status(200).json({
            success : true,
            message : req.t('updatePhase.success' , {ns : 'phase'}),
            data : updatedPhase
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
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