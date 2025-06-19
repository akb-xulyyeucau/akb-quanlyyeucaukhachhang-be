import { 
    createUser , 
    getUserById , 
    updateUserById , 
    deleteUserById , 
    getAllUser , 
    getUser,
    updateUserActive,
    me
} from "../services/user.service";
import { Request, Response } from "express";
import { IUser } from "../interfaces/user.interface";

// lấy tất cả user
export const getAllUserController = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await getAllUser();
        res.status(200).json({
            success: true,
            message: req.t('getAll.success', { ns: 'user' }),
            data: users.map(user => ({
                _id: user._id,
                email: user.email,
                alias: user.alias,
                role: user.role,
            })),
        });
    } catch (error: any) {
        console.error('Error getting users:', error.message);
        res.status(500).json({ 
            success: false,
            message: req.t('getAll.error', { ns: 'user', error: error.message }) 
        });
    }
}

// lấy user theo id
export const getUserByIdController = async (req: Request , res: Response) : Promise<void> => {
    const { id } = req.params;
    try {
        const user = await getUserById(id);
        res.status(200).json({
            success: true,
            message: req.t('getById.success', { ns: 'user' }),
            data: {
                _id: user._id,
                email: user.email,
                alias: user.alias,
                role: user.role,
            }
        });
    } catch (error: any) {
        console.error('Error getting user:', error.message);
        res.status(404).json({ 
            success: false,
            message: req.t('getById.error', { ns: 'user', error: error.message })
        }); 
    }
};

// tạo user
export const createUserController = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email_user, password_user, role } = req.body;
        // Validate đơn giản
        if (!email_user || !password_user ) {
          res.status(400).json({ 
              success: false,
              message: req.t('create.validation', { ns: 'user' })
          });
          return;
        }

        const userData: IUser = {
            email: email_user,
            password: password_user,
            alias: "",
            role: role || 'guest',
            isActive: false,
        };

        const newUser = await createUser(userData);

        res.status(201).json({
            success: true,
            message: req.t('create.success', { ns: 'user' }),
            data: {
                id: newUser._id,
                email: newUser.email,
                alias: newUser.alias,
                role: newUser.role,
            },
        });

    } catch (error: any) {
        console.error('Error creating user:', error.message);
        if (error.message.includes('exists')) {
            res.status(409).json({ 
                success: false,
                message: req.t('create.exists', { ns: 'user' })
            });
            return;
        }
        res.status(500).json({ 
            success: false,
            message: req.t('create.error', { ns: 'user', error: error.message })
        });
    }
};

// cập nhật user theo id
export const udateUserByIdController = async (req : Request , res: Response) : Promise<void> => {
    try {
        const {id} = req.params;
        const { email, password, alias, role } = req.body;
        const userData: IUser = {
            email,
            password,
            alias,
            role: role || 'guest',
        }
        const user = await updateUserById(id, userData);
        res.status(200).json({
            success: true,
            message: req.t('update.success', { ns: 'user' }),
            data: {
                _id: user._id,
                email: user.email,
                alias: user.alias,
                role: user.role,
            },
        })
    } catch (error : any) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ 
            success: false,
            message: req.t('update.error', { ns: 'user', error: error.message })
        });
    }
}

// xóa user theo id
export const deleteUserByIdController = async (req : Request , res: Response) : Promise<void> => {
    try {
        const {id} = req.params;
        const user = await deleteUserById(id);
        res.status(200).json({
            success: true,
            message: req.t('delete.success', { ns: 'user' }),
            data: {
                id: user._id,
                email: user.email,
                alias: user.alias,
                role: user.role,
            },
        })
    } catch (error : any) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ 
            success: false,
            message: req.t('delete.error', { ns: 'user', error: error.message })
        });
    }
}

export const getUserController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit, page, search, role, sort, isActive } = req.query;
        
        // Convert query parameters to correct types
        const parsedLimit = limit ? parseInt(limit as string) : 10;
        const parsedPage = page ? parseInt(page as string) : 1;
        const searchTerm = search ? (search as string) : '';
        const sortOrder = sort ? (sort as string) : 'asc';
        const roleFilter = role ? (role as string) : '';
        const isActiveFilter = isActive ? (isActive as string) : '';

        const result = await getUser({
            limit: parsedLimit,
            page: parsedPage,
            search: searchTerm,
            sort: sortOrder,
            role: roleFilter,
            isActive: isActiveFilter
        });

        res.status(200).json({
            success: true,
            message: req.t('getAll.success', { ns: 'user' }),
            data: result
        });
    } catch (error: any) {
        console.error('Error getting users:', error.message);
        res.status(500).json({ 
            success: false,
            message: req.t('getAll.error', { ns: 'user', error: error.message })
        });
    }
}

export const updateUserActiveController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        
        const result = await updateUserActive(userId, isActive);
        res.status(200).json({
            success: true,
            message: req.t('updateStatus.success', { 
                ns: 'user',
                status: req.t(isActive ? 'updateStatus.active' : 'updateStatus.inactive', { ns: 'user' })
            }),
            data: result.data
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: req.t('updateStatus.error', { ns: 'user', error: error.message })
        });
    }
}

export const meController = async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const userProfile = await me(userId);
        res.status(200).json({
            success: true,
            message: req.t('me.success', { ns: 'user' }),
            data: userProfile
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: req.t('me.error', { ns: 'user', error: error.message })
        });
    }
}