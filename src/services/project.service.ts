import { IProject } from '../interfaces/project.interface';
import Project from '../models/project.model';
import Document from '../models/document.model';
import { genAlias } from '../utils/alias.util';
import { Request } from 'express';

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
        select: 'name emailContact'
    })
    .populate({
        path : 'customer',
        select: 'name emailContact'
    });

    if(!projectRequest) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return projectRequest;
}

export const getProjectById = async (req: Request, pId: string) => {
    // Tìm project và populate các trường cần thiết
    const project = await Project.findById(pId)
        .populate({
            path: 'pm',
            select: 'name emailContact'
        })
        .populate({
            path: 'customer',
            select: 'name emailContact'
        })
        .populate({
            path: 'documentIds',
            model: 'Document',
            populate: {
                path: 'sender',
                select: 'name emailContact'
            }
        });

    if(!project) throw new Error(req.t('notFound', { ns: 'project' }));
    return project;
}

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