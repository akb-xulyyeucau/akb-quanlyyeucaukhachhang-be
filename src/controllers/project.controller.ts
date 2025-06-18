import {
    getAllProject,
    getProjectRequest,
    createProject,  
    updateProjectById,
    deleteProjectById,
    getProjectById,
    activeProject,
    getProjectByCustomerId,
    getProjectRequestByCustomerId,
    addDocumentToProject,
    endingProject
} from '../services/project.service';

import {Request , Response} from 'express';
import {IProject} from '../interfaces/project.interface';
import { pid } from 'process';

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

export const getProjectByIdController = async (req : Request , res : Response) => {
    try {
        const {pId} = req.params;
        const project = await getProjectById(req , pId);
        res.status(200).json({
            success : true,
            message : req.t('getById.success', { ns: 'project' }),
            data : project
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        });
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

export const activeProjectController = async (req : Request , res : Response) => {
    try {
        const {pId} = req.params;
        const data = {
            status : "Đang thực hiện",
            isActive : true
        }
        const activeProjects = await activeProject(req , pId , data);
        res.status(200).json({
            success : true,
            message : req.t('active.success', { ns: 'project' }),
            data : activeProjects
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getProjectByCustomerIdController = async (req : Request , res : Response) => {
    try {
        const {cId} = req.params;
        const project = await getProjectByCustomerId(req , cId);
        res.status(200).json({
            success : true,
            message : req.t('getByCustomerId.success', { ns: 'project' }),
            data : project
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getProjectRequestByCustomerIdController = async (req : Request , res : Response) => {
    try {
        const {cId} = req.params;
        const project = await getProjectRequestByCustomerId(req , cId);
        res.status(200).json({
            success : true,
            message : req.t('getByCustomerId.success', { ns: 'project' }),
            data : project
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const addDocumentToProjectController = async (req : Request , res : Response) => {
  try {
      const {pId} = req.params;
      const {dId} = req.body;
      const updatedProject = await addDocumentToProject(req , pId , dId);
      res.status(200).json({
        success : true,
        message : req.t('addDocumentToProject.success', { ns: 'project' }),
        data : updatedProject
      })
  } catch (error : any) {
     res.status(400).json({
        success : false,
        message : error.message
     })    
  }

}

export const endingProjectController = async (req : Request , res : Response) => {
    try {
        const {pId} = req.params;
        const data = {
            status : "Đã hoàn thành",
            isActive : true
        }
        const activeProjects = await endingProject(req , pId , data);
        res.status(200).json({
            success : true,
            message : req.t('active.success', { ns: 'project' }),
            data : activeProjects
        })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}
