import { IPhase } from "../interfaces/phase.interface";
import Phase from "../models/phase.model";
import { Request } from 'express';
import Project from "../models/project.model";

export const getPhase = async (req : Request)=> {
    const phase = await Phase.find();
    if(!phase){
        throw new Error(req.t('phaseNotFound' , {ns :'phase'}));
    }
    return phase;
}

export const createPhase = async (req : Request , phaseData : IPhase) => {
    const newPhase = await Phase.create(phaseData);
    if(!newPhase) throw new Error(req.t('phaseCreateFailed' , {ns :'phase'}));
    return newPhase;
}

export const updatePhase = async (req : Request , phaseId : string , phaseData : IPhase) => {
    const phase = await Phase.findByIdAndUpdate(phaseId , phaseData , {new : true});
    if(!phase) throw new Error (req.t('phaseNotFound' , {ns : 'phase'}));
    return phase;
}

export const deletePhase = async (req : Request , phaseId : string) => {
    const phase = await Phase.findByIdAndDelete(phaseId);
    if(!phase) throw new Error(req.t('phaseDeleteFailed' , {ns :'phase'}));
    return phase;
}

export const getPhaseByProjectId = async (req : Request , projectId : string) => {
    const project = await Project.findById(projectId);
    if(!project) throw new Error(req.t('projectNotFound' , {ns : 'project'}));
    const phase =  await Phase.findOne({projectId : projectId});
    if(!phase) throw new Error (req.t('phaseNotFound' , {ns : 'phase'}));
    return phase
}