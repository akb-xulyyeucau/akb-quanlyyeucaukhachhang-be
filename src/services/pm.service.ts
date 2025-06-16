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

export const autoSearchPMs = async(req : Request , searchTerm :string = "") =>{
    try {
        let query = {};
        if(searchTerm) {
            const searchPattern = searchTerm
                .toLowerCase()
                .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
                .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
                .replace(/ì|í|ị|ỉ|ĩ/g, "i")
                .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
                .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
                .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
                .replace(/đ/g, "d");

            query = {
                $or: [
                    { 
                        name: { 
                            $regex: searchTerm, 
                            $options: 'i' 
                        } 
                    },
                    { 
                        alias: { 
                            $regex: searchTerm, 
                            $options: 'i' 
                        } 
                    },
                    {
                        $expr: {
                            $regexMatch: {
                                input: {
                                    $replaceAll: {
                                        input: { $toLower: "$name" },
                                        find: "à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ",
                                        replacement: "a"
                                    }
                                },
                                regex: searchPattern,
                                options: "i"
                            }
                        }
                    }
                ]
            };
        }

        const pms = await PM.find(query)
            .select("name alias emailContact phoneContact")
            .limit(10)
            .sort({ name: 1 });

        if(!pms || pms.length === 0) {
            return [];
        }

        return pms;
    } catch (error: any) {
        throw new Error(req.t('serverError', { ns: 'customer', message: error.message }));
    }
}


