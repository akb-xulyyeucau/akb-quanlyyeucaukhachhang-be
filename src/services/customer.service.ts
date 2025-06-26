import Customer from '../models/customer.model';
import { ICustomer } from '../interfaces/customer.interface';
import { genAlias } from '../utils/alias.util';
import User from '../models/user.model';
import { Request } from 'express';
import {splitVietnameseName , compareVN} from '../utils/name.util';
import Project from '../models/project.model';

export const createCustomer = async (req: Request, customerData: ICustomer) => {
    try {
        const allCustomers = await Customer.find();
        const existingAliases = allCustomers.map(c => c.alias);
        customerData.alias = genAlias('customer', existingAliases);
        const isExist = await Customer.findOne({emailContact: customerData.emailContact});
        if(isExist) {
            throw new Error(req.t('alreadyExists', { ns: 'customer' }));
        }
        else {
            const newCustomer = await Customer.create(customerData);
            return newCustomer;
        }
    } catch (error: any) {
        console.error('Error creating customer:', error.message);   
        throw new Error(req.t('create.error', { ns: 'customer', message: error.message }));
    }
}

export const getAllCustomer = async (req: Request) => {
    try {
        const allCustomers = await Customer.find();
        if(!allCustomers) {
            throw new Error(req.t('notFound', { ns: 'customer' }));
        }
        return allCustomers;
    } catch (error) {
        throw new Error(req.t('getAll.error', { ns: 'customer' }));
    }
}

export const getCustomerByUserId = async (req: Request, userId: string) => {
    const user = await User.findById(userId);
    if(!user) {
        throw new Error(req.t('noPersonalInfo', { ns: 'customer' }));
    }
    const id = user._id;
    const customer = await Customer.findOne({userId: id});
    if(!customer){
        throw new Error(req.t('notCreated', { ns: 'customer' }));
    }
    return customer;
}

export const updateCustomerById = async (req: Request, customerId: string, data: ICustomer) => {
    const newRecord = await Customer.findByIdAndUpdate(customerId, data, {new: true});
    if(!newRecord) {
        throw new Error(req.t('notFound', { ns: 'customer' }));
    }
    return newRecord;
}

export const deleteCustomerById = async (req: Request, customerId: string) => {
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if(!deletedCustomer) {
        throw new Error(req.t('notFound', { ns: 'customer' }));
    }
    return deletedCustomer;
}

export const deleteCustomerByUserId = async (req: Request, uId: string) => {
    const existingCustomer = await Customer.findOne({userId: uId});
    if(!existingCustomer){
        return {
            success: true,
            message: req.t('delete.noInfo', { ns: 'customer' })
        };
    }
    
    await Customer.deleteOne({userId: uId});
    return {
        success: true,
        message: req.t('delete.deleteSuccess', { ns: 'customer' })
    };
}

export const getCustomerPagniton = async (req: Request, {
  limit = 10,
  page = 1,
  search = '',
  sort = 'asc',
  sortBy = "alias"
}) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery: any = search ? { name: { $regex: search, $options: 'i' } } : {};
    const total = await Customer.countDocuments(searchQuery);

    let customers = await Customer.find(searchQuery).lean();

    if (sortBy === 'alias') {
      customers = customers.sort((a, b) => {
        const numA = parseInt(a.alias.replace(/[^0-9]/g, ''));
        const numB = parseInt(b.alias.replace(/[^0-9]/g, ''));
        return sort === 'asc' ? numA - numB : numB - numA;
      });
    } else if (sortBy === 'name') {
      customers = customers.sort((a, b) => {
        const nameA = splitVietnameseName(a.name);
        const nameB = splitVietnameseName(b.name);

        const compareFirst = compareVN(nameA.firstName, nameB.firstName);
        if (compareFirst !== 0) return sort === 'asc' ? compareFirst : -compareFirst;

        const compareLast = compareVN(nameA.lastName, nameB.lastName);
        if (compareLast !== 0) return sort === 'asc' ? compareLast : -compareLast;

        const compareMiddle = compareVN(nameA.middleName, nameB.middleName);
        return sort === 'asc' ? compareMiddle : -compareMiddle;
      });
    }

    const pagedCustomers = customers.slice(skip, skip + limit);

    return {
      customers: pagedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error: any) {
    throw new Error(req.t('serverError', { ns: 'customer', message: error.message }));
  }
}

export const autoSearchCustomers = async(req: Request, searchTerm: string = "") => {
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

        const customers = await Customer.find(query)
            .select("name alias emailContact phoneContact")
            .limit(10)
            .sort({ name: 1 });

        if(!customers || customers.length === 0) {
            return [];
        }

        return customers;
    } catch (error: any) {
        throw new Error(req.t('serverError', { ns: 'customer', message: error.message }));
    }
}

export const customerStatistic = async () => {
    try {
        // Đếm số lượng khách hàng đã từng có trong bất kỳ dự án nào
        const customerIdsInProject = await Project.distinct("customer");
        const totalCustomerInProject = customerIdsInProject.length;
        const totalProject = await Project.countDocuments({isActive : true});
        // Nếu muốn trả về tổng số khách hàng trong hệ thống:
        const totalCustomer = await Customer.countDocuments();
        let percentProjectWithCustomer = 0;
        if(totalCustomer !== 0){
           percentProjectWithCustomer = Math.round(totalCustomerInProject/totalCustomer * 100);
        }
        //Khách hàng [] có n dự án , n dự án phải khác 0
        let customersWithProjects = await Project.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$customer",
                    projects: { $push: { _id: "$_id", name: "$name", alias: "$alias" , status : "$status"} },
                    projectCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    _id: { $ne: null }, // Loại bỏ project không có customer
                    projectCount: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "customerInfo"
                }
            },
            {
                $unwind: "$customerInfo"
            },
            {
                $project: {
                    _id: 0,
                    customerId: "$customerInfo._id",
                    customerName: "$customerInfo.name",
                    customerAlias: "$customerInfo.alias",
                    emailContact: "$customerInfo.emailContact",
                    projectCount: 1,
                    projects: 1
                }
            }
        ]);
       if (totalProject > 0) {
            customersWithProjects = customersWithProjects.map(c => ({
                ...c,
                percentProject: Math.round((c.projectCount / totalProject) * 100)
            }));
        }

        // Tìm projectCount lớn nhất
        const maxProjectCount = customersWithProjects.reduce(
            (max, c) => c.projectCount > max ? c.projectCount : max,
            0
        );

        // Lọc ra các khách hàng có projectCount = maxProjectCount
        const topCustomers = customersWithProjects.filter(c => c.projectCount === maxProjectCount);

        return {
            totalCustomerInProject,
            totalCustomer,
            percentProjectWithCustomer,
            customersWithProjects : topCustomers // chỉ trả về khách hàng có nhiều dự án nhất
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}