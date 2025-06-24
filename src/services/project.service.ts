import { IProject , IUserSender , IDocumentPopulated , IProjectPopulated } from '../interfaces/project.interface';
import Project from '../models/project.model';
import Document from '../models/document.model';
import { genAlias } from '../utils/alias.util';
import { Request } from 'express';
import mongoose from 'mongoose';
import Customer from '../models/customer.model';
import Phase from '../models/phase.model';

export const getAllProject = async (req: Request) => {
    const project = await Project.find({isActive : true})
    .populate({
        path: 'pm',
        select: 'name emailContact'
    })
    .populate({
        path: 'customer',
        select: 'name emailContact'
    });
    
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const getProjectRequest = async (req : Request , isActive : Boolean) => {
    const projectRequest = await Project.find({isActive : isActive})
    .populate({
        path : 'pm',
        select: 'name emailContact '
    })
    .populate({
        path : 'customer',
        select: 'name emailContact '
    });

    if(!projectRequest) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return projectRequest;
}


export const getProjectById = async (req: Request, pId: string) => {
    const project = await Project.findById(pId)
        .populate({
            path: 'pm',
            select: 'name emailContact phoneContact'
        })                  
        .populate({
            path: 'customer',
            select: 'name emailContact phoneContact' 
        })
        .populate({
            path: 'documentIds',
            populate: {
                path: 'sender',
                select: '_id email alias role',
                model: 'User',
            },
        }) as unknown as IProjectPopulated;

    if (!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    // Add name to sender based on role
    if (project.documentIds?.length > 0) {
        for (const doc of project.documentIds as IDocumentPopulated[]) {
            if (doc.sender) {
                const sender = doc.sender as IUserSender;
                if (!sender.name) {
                    if (sender.role === 'pm') {
                        const pmInfo = await mongoose.model('PM').findOne({ userId: sender._id }).select('name');
                        if (pmInfo && 'name' in pmInfo) {
                            sender.name = pmInfo.name;
                        }
                    } else if (sender.role === 'guest') {
                        const customerInfo = await mongoose.model('Customer').findOne({ userId: sender._id }).select('name');
                        if (customerInfo && 'name' in customerInfo) {
                            sender.name = customerInfo.name;
                        }
                    }
                }
            }
        }
    }
    const userId = req.user?._id; 
    const userRole = req.user?.role;
    if(userRole === 'guest') {
       const c =  await Customer.findOne({userId});
        if(c?._id.toString() !== project.customer._id.toString()){
             throw new Error("Ngoài quyền sở hữu tài nguyên")
        }
    }
    return project;
};

export const createProject = async (req: Request, projectData: IProject) => {
    const allProjects = await Project.find();
    const existingAliases = allProjects.map(item => item.alias);
    projectData.alias = genAlias('project', existingAliases);
    const project = await Project.create(projectData);
    if(!project) {
        throw new Error(req.t('create.error', { ns: 'project' }));
    }
    return project;
}

export const updateProjectById = async (req: Request, pId: string, projectData: IProject) => {
    const updatedProject = await Project.findByIdAndUpdate(pId, projectData, { new: true });
    if(!updatedProject){
        throw new Error(req.t('update.error', { ns: 'project' }));
    }
    return updatedProject;
}

export const deleteProjectById = async (req: Request, pId: string) => {
    // Tìm project trước khi xóa để lấy documentIds
    const project = await Project.findById(pId);
    if(!project) {
        throw new Error(req.t('delete.error', { ns: 'project' }));
    }
    // Cập nhật trạng thái isTrash của tất cả documents liên quan
    if(project.documentIds && project.documentIds.length > 0) {
        await Document.updateMany(
            { _id: { $in: project.documentIds } },
            { isTrash: true }
        );
    }
    // Xóa project
    const deletedProject = await Project.findByIdAndDelete(pId);
    return deletedProject;
}

export const activeProject = async (req : Request , pId : string , data : {status : string , isActive : boolean}) => {
    const project = await Project.findByIdAndUpdate(pId , data , {new : true});
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const getProjectByCustomerId = async (req : Request , cId : string) => {
    const project = await Project.find({customer : cId , isActive : true})
    .populate({
        path : 'pm',
        select : 'name emailContact'
    })
    .populate({
        path : 'customer',
        select : 'name emailContact'
    })
    if(!project ) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const getProjectRequestByCustomerId = async (req : Request , cId : string) => {
    const project = await Project.find({customer : cId , isActive : false})
    .populate({
        path : 'pm',
        select : 'name emailContact'
    })
    .populate({
        path : 'customer',
        select : 'name emailContact'
    })
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const addDocumentToProject = async (req : Request , pId : string , dId : string) =>{
    const updatedProject = await Project.findByIdAndUpdate(pId, 
        {
            $push : {documentIds : dId},
        }, 
        {new : true}
    ).populate('documentIds');
    if(!updatedProject){
        throw new Error(req.t('notFound' , {ns : 'project'}));
    }
    return updatedProject;

}

export const endingProject = async (req : Request , pId : string , data : {status : string , isActive : boolean}) => {
    const project = await Project.findByIdAndUpdate(pId , data , {new : true});
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const projectStatisticById = async (req : Request , projectId : string) => {
    try {
        const project  = await Project.findById(projectId)
        .populate({
            path : 'pm',
            select : 'name alias emailContact'
        })
        .populate ({
            path : 'customer',
            select : 'name alias emailContact'
        })
        .populate('documentIds');
        console.log("project : " , project);
        // thông tin các giai đoạn của dự án
        const startDate = project?.day;
        const phaseInProject = await Phase.findOne({projectId : projectId});
        const currentPhase = phaseInProject?.currentPhase;
        const phaseNum = phaseInProject?.phases.length || 0;
        const estimateDate = phaseInProject?.phases[phaseNum -1].day;
        // thông tin báo cáo
        
    } catch (error) {
        
    }
} 