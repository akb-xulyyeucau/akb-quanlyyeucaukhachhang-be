import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { IUserDocument } from '../interfaces/user.interface';
import { envKey } from '../configs/key.config';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token;
        
        // Check Authorization header first
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // If no token in header, check cookies
        else if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: req.t('authorization.no_token', { ns: 'auth' })
            });
            return;
        }

        try {
            const decoded = jwt.verify(token, envKey.jwt.access_secret) as { userId: string };
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
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: req.t('authorization.token_expired', { ns: 'auth' }),
                    isExpired: true
                });
                return;
            }
            throw error;
        }
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

        const decoded = jwt.verify(refreshToken, envKey.jwt.refresh_secret) as { userId: string };
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

// middlewares/checkOwnership.ts

