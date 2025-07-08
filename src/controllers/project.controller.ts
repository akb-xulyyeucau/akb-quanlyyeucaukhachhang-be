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
import {IProject} from '../interfaces/project.interface'
;
import dayjs from 'dayjs';
import { queueMail, EmailTemplates } from '../utils/mail.util';
import Customer from '../models/customer.model';
import { ICustomer } from '../interfaces/customer.interface';
import { IUserDocument } from '../interfaces/user.interface';
import Project from '../models/project.model';

export const createProjectController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        const { name, pm, customer, status, day, documentIds } = req.body;
        
        // Tạo dự án mới
        const projectData: IProject = {
            alias: '', // Sẽ được generate trong service
            name,
            pm,
            customer,
            status,
            day: new Date(day),
            isActive: false,
            documentIds: documentIds || []
        };

        const newProject = await createProject(req, projectData);

        // Lấy thông tin customer để gửi mail
        const customerInfo = await Customer.findById(customer).lean();
        if (customerInfo && customerInfo.emailContact) {
            // Thêm mail vào queue với độ ưu tiên cao (1)
            await queueMail(
                {
                    to: customerInfo.emailContact,
                    ...EmailTemplates.PROJECT_CREATED(name, user.alias || 'Admin'),
                    priority: 1 // Ưu tiên cao cho thông báo dự án mới
                },
                userId,
                req
            );
        }

        res.status(201).json({
            success: true,
            message: req.t('create.success', { ns: 'project' }),
            data: newProject
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
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

export const activeProjectController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        const {pId} = req.params;
        const data = {
            day: Date.now(),
            status: "Đang thực hiện",
            isActive: true
        }
        const activeProjects = await activeProject(req, pId, data);

        // Gửi mail thông báo khi kích hoạt dự án
        const project = await Project.findById(pId).populate('customer');
        if (project && (project.customer as any).emailContact) {
            await queueMail(
                {
                    to: (project.customer as any).emailContact,
                    ...EmailTemplates.PROJECT_CREATED(project.name, user.alias || 'Admin'),
                    priority: 1 
                },
                userId,
                req
            );
        }

        res.status(200).json({
            success: true,
            message: req.t('active.success', { ns: 'project' }),
            data: activeProjects
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
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

export const addDocumentToProjectController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        const {pId} = req.params;
        const {dId} = req.body;   
        const updatedProject = await addDocumentToProject(req, pId, dId);

        // Gửi mail thông báo khi thêm tài liệu mới
        const project = await Project.findById(pId)
            .populate('customer')
            .populate({
                path: 'documentIds',
                select: 'name originalName'
            });

        if (project && (project.customer as any).emailContact) {
            const document = (project.documentIds as any[])?.find(doc => doc._id.toString() === dId);
            if (document) {
                await queueMail(
                    {
                        to: (project.customer as any).emailContact,
                        ...EmailTemplates.DOCUMENT_ADDED(project.name, document.originalName || document.name),
                        priority: 2 // Ưu tiên trung bình cho thông báo tài liệu mới
                    },
                    userId,
                    req
                );
            }
        }

        res.status(200).json({
            success: true,
            message: req.t('addDocumentToProject.success', { ns: 'project' }),
            data: updatedProject
        })
    } catch (error: any) {
        res.status(400).json({ 
            success: false,
            message: error.message
        })    
    }
}

export const endingProjectController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        const {pId} = req.params;
        const data = {
            status: "Đã hoàn thành",
            isActive: true
        }
        const activeProjects = await endingProject(req, pId, data);

        // Gửi mail thông báo khi dự án kết thúc
        const project = await Project.findById(pId)
            .populate('customer')
            .populate('pm');

        if (project) {
            // Gửi mail cho khách hàng
            if ((project.customer as any).emailContact) {
                await queueMail(
                    {
                        to: (project.customer as any).emailContact,
                        ...EmailTemplates.PROJECT_ENDED(project.name),
                        priority: 1 // Ưu tiên cao cho thông báo kết thúc dự án
                    },
                    userId,
                    req
                );
            }

            // Gửi mail cho PM
            if ((project.pm as any).email) {
                await queueMail(
                    {
                        to: (project.pm as any).email,
                        ...EmailTemplates.PROJECT_ENDED(project.name),
                        priority: 1 // Ưu tiên cao cho thông báo kết thúc dự án
                    },
                    userId,
                    req
                );
            }
        }

        res.status(200).json({
            success: true,
            message: req.t('active.success', { ns: 'project' }),
            data: activeProjects
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
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
