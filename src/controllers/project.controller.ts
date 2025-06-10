import {
    getAllProject,
    getProjectRequest,
    createProject,  
    updateProjectById,
    deleteProjectById
} from '../services/project.service';

import {Request , Response} from 'express';
import {IProject} from '../interfaces/project.interface';

export const createProjectController = async (req : Request , res : Response) => {
    try {
        const {name , pm , customer , status , day , documentIds}= req.body;
        const projectData : IProject = {
            alias : '',
            name : name,
            pm : pm ,
            customer : customer,
            status :status,
            day : day,
            isActive : false,
            documentIds : documentIds
        }
        const newProject = await createProject(req, projectData);
        res.status(201).json({
            success : true,
            message : req.t('create.success', { ns: 'project' }),
            data : newProject
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
};

export const getAllProjectController = async (req : Request , res : Response) => {
    try {
        const allProjects = await getAllProject(req);
        res.status(200).json({
            success : true,
            message  : req.t('getAll.success', { ns: 'project' }),
            data : allProjects
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getProjectRequestController = async (req : Request , res : Response) => {
    try {
        const {isActive} = req.query;
        const isRequest = "false"
        const projectRequests = await getProjectRequest(req ,  isRequest as unknown as Boolean);
        res.status(200).json({
            success : true,
            message : req.t('getAll.success', { ns: 'project' }),
            data : projectRequests
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const updateProjectByIdController = async (req : Request , res : Response)=>{
    try {
        const {pId} = req.params;
        const {alias ,name , pm , customer , status, isActive , day , documentIds} = req.body;
        const updateData : IProject = {
            alias : alias,
            name : name,
            pm : pm,
            customer : customer,
            status : status,
            day: day,
            isActive : isActive,
            documentIds : documentIds,
        }
        const updatedProject = await updateProjectById(req, pId , updateData);
        res.status(200).json({
            success : true,
            message : req.t('update.success', { ns: 'project' }),
            data : updatedProject
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const deleteProjectByIdController = async (req : Request , res : Response) => {
    try {
        const {pId} = req.params;
        const result = await deleteProjectById(req, pId);
        res.status(200).json({
            success : true,
            message : req.t('delete.success', { ns: 'project' }),
            data : result
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}