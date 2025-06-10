import { IProject } from '../interfaces/project.interface';
import Project from '../models/project.model';
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
    const deletedProject = await Project.findByIdAndDelete(pId);
    if(!deletedProject){
        throw new Error(req.t('delete.error', { ns: 'project' }));
    } 
    return deletedProject;
}