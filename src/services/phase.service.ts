import { IPhase } from "../interfaces/phase.interface";
import Phase from "../models/phase.model";
import { Request } from 'express';
import Project from "../models/project.model";
import Customer from "../models/customer.model";

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
      const userId = req.user?._id;
        const userRole = req.user?.role;
        console.log("User ID:", userId);
        console.log("User Role:", userRole);
    
        if (userRole === 'guest') {
            const c = await Customer.findOne({ userId });
            const p = await Project.findOne({ _id: projectId });
            console.log("Customer found:", c);
            console.log("Project found:", p);
            console.log("Customer ID from Customer:", c?._id?.toString());
            console.log("Customer ID from Project:", p?.customer?.toString());
            if (!c || !p) {
                throw new Error("Không tìm thấy thông tin khách hàng hoặc dự án");
            }
            if (c._id.toString() !== p.customer.toString()) {
                throw new Error("Ngoài quyền sở hữu");
            }
        }
    return phase
}