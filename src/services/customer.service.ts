import Customer from '../models/customer.model';
import { ICustomer } from '../interfaces/customer.interface';
import { genAlias } from '../utils/alias.util';
import User from '../models/user.model';
import { Request } from 'express';

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
        return sort === 'asc'
          ? a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
          : b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' });
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
