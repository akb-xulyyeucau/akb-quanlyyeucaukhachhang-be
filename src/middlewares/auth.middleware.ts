import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { IUserDocument } from '../interfaces/user.interface';


export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: req.t('authorization.no_token', { ns: 'auth' })
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default-access-secret') as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({
                success: false,
                message: req.t('errors.user_not_found', { ns: 'auth' })
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: req.t('authorization.invalid_token', { ns: 'auth' })
        });
        return;
    }
};

export const verifyRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: req.t('refresh_token.missing', { ns: 'auth' })
            });
            return;
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({
                success: false,
                message: req.t('errors.user_not_found', { ns: 'auth' })
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: req.t('refresh_token.invalid', { ns: 'auth' })
        });
        return;
    }
};

// Middleware phân quyền
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as IUserDocument;
        
        if (!user || !user.role) {
            res.status(401).json({
                success: false,
                message: req.t('authorization.invalid_user_role', { ns: 'auth' })
            });
            return;
        }

        if (!roles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: req.t('authorization.insufficient_permissions', { ns: 'auth' })
            });
            return;
        }

        next();
    };
};
