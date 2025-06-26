import User from "../models/user.model";
import { IUser } from '../interfaces/user.interface';
import { genAlias  } from "../utils/alias.util";
import Customer from "../models/customer.model";
import PM from "../models/pm.model";
// lấy tất cả user
export const getAllUser = async () => {
    const users = await User.find();
    if(!users) {
        throw new Error('User not found');
    }
    return users;
}
// lấy user theo id
export const getUserById = async (id: string) => {
    const user = await User.findById(id);
    if(!user) {
        throw new Error('User not found');
    }
    return user;
}
// tạo user
export const createUser = async (userData: IUser) => {
    const existUser = await User.findOne({email: userData.email})
    if (!userData.alias || userData.alias === '') {
        const count = await User.countDocuments();
        const allUsers = await User.find({}, 'alias');
        const existingAliases = allUsers.map(u => u.alias)
        userData.alias = genAlias('user', existingAliases);
    }
    if(existUser) {
        throw new Error('User already exists');
    }
    const user = await User.create(userData);
    if(!user) {
        throw new Error('Failed to create user');
    }
    return user;
}

// update user theo id
export const updateUserById = async (id: string, userData: IUser) => {
   try {
    const user = await User.findByIdAndUpdate(id, userData, {new: true});
    if(!user) {
        throw new Error('User not found');
    }
    return user;
   } catch (error: any) {
    throw new Error(`Server error: ${error.message}`);
   }
}

// xóa user theo id
export const deleteUserById = async (id: string) => {
    const user = await User.findByIdAndDelete(id);
    if(!user) {
        throw new Error('User not found');
    }
    return user;
}

// Lấy user với phân trang, tìm kiếm và sắp xếp
export const getUser = async ({limit = 10, page = 1, search = '', role = '', sort = 'asc', isActive = ''}) => {
    try {
        const skip = (page - 1) * limit;
        let searchQuery: any = search ? { alias: { $regex: search, $options: 'i' } } : {};
        
        if (role) {
            searchQuery.role = role;
        }
        if (isActive !== '') {
            const isActiveBool = isActive.toLowerCase() === 'true';
            searchQuery.isActive = isActiveBool;
        }
        const total = await User.countDocuments(searchQuery);
        let users = await User.find(searchQuery).select('-password');        
        users = users.sort((a, b) => {
            const numA = parseInt(a.alias.replace(/[^0-9]/g, ''));
            const numB = parseInt(b.alias.replace(/[^0-9]/g, ''));
            return sort === 'asc' ? numA - numB : numB - numA;
        });
        users = users.slice(skip, skip + limit);
        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error: any) {
        throw new Error(`Server error: ${error.message}`);
    }
}

// Cập nhật trạng thái isActive của user
export const updateUserActive = async (userId: string, isActive: boolean) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        );
        if (!user) {
            throw new Error('User not found');
        }
        return {
            success: true,
            data: user
        };
    } catch (error: any) {
        throw new Error(`Failed to update user status: ${error.message}`);
    }
}
export const me = async (userId : string) => {
    const user : IUser | null = await User.findById(userId).select('-password');
    if(!user) throw new Error('User not found');
    if(user.role === 'guest') {
        const profile = await Customer.findOne({userId: userId});
        if(!profile) throw new Error('Customer not found');
        return {user , profile};
    }
    if(user.role === 'pm') {
        const profile = await PM.findOne({userId: userId});
        if(!profile) throw new Error('PM not found');
        return {user , profile};
    }
    if(user.role === 'admin') {
        return {user , profile: null};
    }
    throw new Error('User not found');
}

export const userStatistic = async () => {
   try {
        const users = await User.find();
        const totalUsers = users.length;
        const totalActive = users.filter((u) => (u.isActive))
        const totalCustomerActive = users.filter((u) => (u.role==='guest' && u.isActive));
        const totalPMActive = users.filter((u) => (u.role==='pm' && u.isActive));
        let percentActive = 0;
        let percentPM = 0
        let percentCustomer = 0
        if(totalUsers !== 0){
            percentActive = Math.round((totalActive.length / totalUsers) * 100);
        }
        if(totalActive.length !== 0){
            percentPM = Math.round((totalActive.length / totalUsers) * 100);
            percentCustomer = 100 - percentPM;
        }
        return {
            totalUsers : totalUsers,
            totalActive : totalActive.length,
            percentActive : percentActive,
            totalCustomer : totalCustomerActive.length,
            totalPM : totalPMActive.length,
            percentPM,
            percentCustomer
        }
   } catch (error : any) {
        throw new Error(error.message)
   }
}