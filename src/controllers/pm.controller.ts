import { Request, Response } from "express";
import { 
    createPM, 
    getAllPM, 
    getPMByUserId, 
    updatePMById, 
    deletePMById,
    deletePMByUserId,
    autoSearchPMs
} from "../services/pm.service";
import { IPM } from "../interfaces/pm.interface";

export const createPMController = async (req: Request, res: Response) => {
    try {
        const {alias, userId, name, emailContact, phoneContact, dob} = req.body;
        const dataPM: IPM = {
            alias: "",
            userId,
            name: name,
            emailContact: emailContact,
            phoneContact: phoneContact,
            dob: dob,
        }
        const pm = await createPM(req, dataPM);
        res.status(201).json({
            success: true,
            message: req.t('create.success', { ns: 'pm' }),
            data: pm
        })
        
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const getAllPMController = async (req: Request, res: Response) => {
    try {
        const pm = await getAllPM(req);
        res.status(200).json({
            success: true,
            message: req.t('getAll.success', { ns: 'pm' }),
            data: pm
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })  
    }
}

export const getPMByUserIdController = async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const pm = await getPMByUserId(req, userId);
        res.status(200).json({
            success: true,
            message: req.t('getByUserId.success', { ns: 'pm' }),
            data: pm
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const updatePMByIdController = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {alias, userId, name, emailContact, phoneContact, dob} = req.body;
        const dataPM: IPM = {
            alias: alias,
            userId: userId,
            name: name,
            emailContact: emailContact,
            phoneContact: phoneContact,
            dob: dob,
        }
        const pm = await updatePMById(req, id, dataPM);
        res.status(200).json({
            success: true,
            message: req.t('update.success', { ns: 'pm' }),
            data: pm
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const deletePMByIdController = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const pm = await deletePMById(req, id);
        res.status(200).json({
            success: true,
            message: req.t('delete.success', { ns: 'pm' }),
            data: pm
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const deletePMByUserIdController = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const result = await deletePMByUserId(req, id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const autoSearchPMsController = async (req : Request , res : Response) => {
    try {
        const {searchTerm} = req.query;
        const pms = await autoSearchPMs(req , String(searchTerm));
        res.status(200).json({
            success : true,
            message : req.t('autoSearch.success', { ns: 'pm' }),
            data : pms
        })
    } catch ( error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}