import { 
    createCustomer , 
    getAllCustomer , 
    getCustomerByUserId, 
    updateCustomerById , 
    deleteCustomerById,
    deleteCustomerByUserId,
    getCustomerPagniton
 } from '../services/customer.service';
import { Request, Response } from 'express';
import {ICustomer} from  "../interfaces/customer.interface";

export const createCustomerCotroller = async (req : Request , res : Response) => {
    try {
       const {name, userId, emailContact  , phoneContact , companyName , dob , address , note} = req.body;
       const customerData : ICustomer = {
            alias : "",
            userId : userId,
            name : name,
            emailContact : emailContact,
            phoneContact : phoneContact,
            companyName : companyName,
            dob : dob,
            address : address,
            note : note,
       }
       const newCustomer = await createCustomer(req, customerData);
       res.status(201).json({
            success : true,
            message : req.t('create.success', { ns: 'customer' }),
            data : newCustomer
       })
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        })      
    }
}   

export const getAllCustomerController = async (req : Request , res : Response) => {
    try {
        const allCustomer = await getAllCustomer(req);
        res.status(200).json({
            success : true,
            message : req.t('getAll.success', { ns: 'customer' }),
            data : allCustomer
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        });
    }
}

export const getCustomerByUserIdController = async (req : Request , res : Response) => {
    try {
        const {userId} =  req.params;
        const customer = await getCustomerByUserId(req, userId);
        res.status(200).json({
            success : true,
            message : req.t('getByUserId.success', { ns: 'customer' }),
            data : customer
        });     
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        });
    }
}
export const updateCustomerByIdController = async (req : Request , res : Response)=> {
    try {
        const {id} = req.params;
        const {name, alias , userId , emailContact , phoneContact , companyName , dob , address , note} = req.body;
        const data : ICustomer = {
            alias : alias,
            userId : userId,
            name : name,
            emailContact : emailContact,
            phoneContact : phoneContact,
            companyName : companyName,
            dob : dob,
            address : address,
            note : note,
        }
        const updatedCustomer = await updateCustomerById(req, id , data);
        res.status(201).json({
            success : true,
            message : req.t('update.success', { ns: 'customer' }),
            data : updatedCustomer
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        });
    }
};

export const deleteCustomerByIdController = async (req : Request , res : Response) => {
    try {
        const {id}  = req.params;
        const deletedCustomer = await deleteCustomerById(req, id);
        res.status(200).json({
            success : true,
            message : req.t('delete.success', { ns: 'customer' }),
            data : deletedCustomer
        });
    } catch (error : any) {
        res.status(400).json({
            success : false,
            message : error.message
        });
    }
};

export const deleteCustomerByUserIdController = async (req : Request , res : Response) => {
    try {
        const {id} = req.params;
        const result = await deleteCustomerByUserId(req, id);
        res.status(200).json({
            success : true,
            message : result.message
        });
    } catch (error : any) {
        res.status(400).json({
            success: false,
            message : error.message
        });
    }
}

export const getCustomerPagnitonController = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'asc', sortBy = 'alias' } = req.query;

        const result = await getCustomerPagniton(req, {
            page: Number(page),
            limit: Number(limit),
            search: String(search),
            sort: String(sort),
            sortBy: String(sortBy),
        });

        res.status(200).json({
            success: true,
            message: req.t('getPagination.success', { ns: 'customer' }),
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};