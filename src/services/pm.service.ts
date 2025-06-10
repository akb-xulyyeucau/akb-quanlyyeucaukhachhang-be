import PM from "../models/pm.model";
import { IPM } from "../interfaces/pm.interface";
import { genAlias } from "../utils/alias.util";
import User from "../models/user.model";
import { Request } from 'express';

export const createPM = async (req: Request, pmData: IPM) => {
   const allPMs = await PM.find();
   const existingAliases = allPMs.map(pm => pm.alias);
   pmData.alias = genAlias('pm', existingAliases);
   const isExist = await PM.findOne({emailContact: pmData.emailContact});
   if(isExist) {
    throw new Error(req.t('alreadyExists', { ns: 'pm' }));
   }
   else {
    const newPM = await PM.create(pmData);
    return newPM;
   }
}

export const getAllPM = async (req: Request) => {
    const allPM = await PM.find();
    if(!allPM) {
        throw new Error(req.t('notFound', { ns: 'pm' }));
    }
    else {
        return allPM;
    }
}

export const getPMByUserId = async (req: Request, userId: string) => {
   const usser = await User.findById(userId);
   if(!usser) {
    throw new Error(req.t('noPersonalInfo', { ns: 'pm' }));
   }
   const id = usser._id;
   const pm = await PM.findOne({userId: id});
   if(!pm) {
    throw new Error(req.t('notCreated', { ns: 'pm' }));
   }
   return pm;
}

export const updatePMById = async (req: Request, pmId: string, data: IPM) => {
    const pm = await PM.findByIdAndUpdate(pmId, data, {new: true});
    if(!pm) {
        throw new Error(req.t('notFound', { ns: 'pm' }));
    }
    else {
        return pm;
    }
}

export const deletePMById = async (req: Request, pmId: string) => {
    const pm = await PM.findByIdAndDelete(pmId);
    if(!pm) {
        throw new Error(req.t('notFound', { ns: 'pm' }));
    }
}

export const deletePMByUserId = async (req: Request, uId: string) => {
    const existingPM = await PM.findOne({userId: uId});
    if(!existingPM) {
        return {
            success: true,
            message: req.t('delete.noInfo', { ns: 'pm' })
        };
    }
    
    await PM.deleteOne({userId: uId});
    return {
        success: true,
        message: req.t('delete.deleteSuccess', { ns: 'pm' })
    };
}


