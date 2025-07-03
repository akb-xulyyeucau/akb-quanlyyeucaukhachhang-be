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
    endingProject,
    projectStatisticById,
    projectStatistic,
    projectStatisticByGuest
} from '../services/project.service';

import {Request , Response} from 'express';
import {IProject} from '../interfaces/project.interface';
import dayjs from 'dayjs';

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

export const getAllProjectController = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate time filter if provided
        if (req.query.timeFilter) {
            try {
                const timeFilter = JSON.parse(req.query.timeFilter as string);
                if (!timeFilter.type || !timeFilter.year || !timeFilter.value) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid time filter format. Required: type (month/quarter), year, and value'
                    });
                    return;
                }
                if (timeFilter.type !== 'month' && timeFilter.type !== 'quarter') {
                    res.status(400).json({
                        success: false,
                        message: 'Time filter type must be either "month" or "quarter"'
                    });
                    return;
                }
                if (timeFilter.type === 'month' && (timeFilter.value < 1 || timeFilter.value > 12)) {
                    res.status(400).json({
                        success: false,
                        message: 'Month value must be between 1 and 12'
                    });
                    return;
                }
                if (timeFilter.type === 'quarter' && (timeFilter.value < 1 || timeFilter.value > 4)) {
                    res.status(400).json({
                        success: false,
                        message: 'Quarter value must be between 1 and 4'
                    });
                    return;
                }
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid time filter JSON format'
                });
                return;
            }
        }

        // Validate pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        if (page < 1 || limit < 1) {
            res.status(400).json({
                success: false,
                message: 'Page and limit must be positive numbers'
            });
            return;
        }

        const result = await getAllProject(req);
        res.status(200).json({
            success: true,
            message: req.t('getAll.success', { ns: 'project' }),
            data: result.projects,
            pagination: result.pagination
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
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
            day : Date.now(),
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

export const getProjectByCustomerIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cId } = req.params;

        // Validate time filter if provided
        if (req.query.timeFilter) {
            try {
                const timeFilter = JSON.parse(req.query.timeFilter as string);
                if (!timeFilter.type || !timeFilter.year || !timeFilter.value) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid time filter format. Required: type (month/quarter), year, and value'
                    });
                    return;
                }
                if (timeFilter.type !== 'month' && timeFilter.type !== 'quarter') {
                    res.status(400).json({
                        success: false,
                        message: 'Time filter type must be either "month" or "quarter"'
                    });
                    return;
                }
                if (timeFilter.type === 'month' && (timeFilter.value < 1 || timeFilter.value > 12)) {
                    res.status(400).json({
                        success: false,
                        message: 'Month value must be between 1 and 12'
                    });
                    return;
                }
                if (timeFilter.type === 'quarter' && (timeFilter.value < 1 || timeFilter.value > 4)) {
                    res.status(400).json({
                        success: false,
                        message: 'Quarter value must be between 1 and 4'
                    });
                    return;
                }
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid time filter JSON format'
                });
                return;
            }
        }

        // Validate pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        if (page < 1 || limit < 1) {
            res.status(400).json({
                success: false,
                message: 'Page and limit must be positive numbers'
            });
            return;
        }

        const result = await getProjectByCustomerId(req, cId);
        res.status(200).json({
            success: true,
            message: req.t('getByCustomerId.success', { ns: 'project' }),
            data: result.projects,
            pagination: result.pagination
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
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

export const projectStatistcByIdController = async (req : Request , res : Response) => {
    try {
        const {projectId} = req.params;
        const statistic = await projectStatisticById(req , projectId);
        res.status(200).json({
            success : true,
            message : req.t('statistc.success' , {ns : 'project'}),
            data : statistic
        })
    } catch (error : any) {
         res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const projectStatisticController = async (req : Request , res : Response) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'guest'){
            const statistc = await projectStatistic();
            res.status(200).json({
                success : true,
                message : 'Thống kê thành công !',
                data: statistc
            })
        }
        else {
            const statistc = await projectStatisticByGuest(req);
            res.status(200).json({
                success : true,
                message : 'Thống kê thành công !',
                data: statistc
            })
        }
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}
