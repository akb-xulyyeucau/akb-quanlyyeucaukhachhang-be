import {Request , Response} from 'express';
import {
    loginUserService , 
    refreshTokenServices
} from '../services/auth.service';
import { IUserDocument } from '../interfaces/user.interface';

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}
import {envKey} from '../configs/key.config';
const isDev = envKey.app.env === "development";
export const loginUserController = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email , password } = req.body;
        if(!email || !password) {
            res.status(400).json(
                {
                    success: false,
                    message: req.t('validation.required_fields', { 
                        ns: 'auth',
                        fields: `${req.t('email', { ns: 'auth' })}, ${req.t('password', { ns: 'auth' })}` 
                    })
                }
            );
            return;
        }
        const {accessToken , refreshToken , user} = await loginUserService(email , password);
        
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev ? 'strict' : 'none',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Set access token in a non-HTTP-only cookie so frontend can access it
        res.cookie('accessToken', accessToken, {
            httpOnly: false, // Allow frontend to read this
            secure: !isDev,
            sameSite: isDev ? 'strict' : 'none',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            success: true,
            message: req.t('login_success', { ns: 'auth' }),
            data : {
                _id: user._id,
                email: user.email,
                alias: user.alias,
                role: user.role,
                accessToken: accessToken // Include token in response for immediate use
            }
        })
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? 
                req.t('login_failed', { ns: 'auth' }) : 
                req.t('errors.server_error', { ns: 'auth' })
        });
    }
}

export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as IUserDocument;
        if (!user || !user._id) {
            throw new Error(req.t('errors.user_not_found', { ns: 'auth' }));
        }
        const { accessToken, user: userData } = await refreshTokenServices(user._id.toString());
        
        res.status(200).json({
            success: true,
            message: req.t('refresh_token.success', { ns: 'auth' }),
            data: {
                accessToken,
                user: {
                    _id: userData._id,
                    email: userData.email,
                    alias: userData.alias,
                    role: userData.role
                }
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? 
                error.message : 
                req.t('refresh_token.error', { ns: 'auth' })
        });
    }
};

export const logoutController = async (req: Request, res: Response): Promise<void> => {
    try {
        // Xóa refresh token từ cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev?'strict':'none',
            path: '/'
        });
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev?'strict':'none'
        });
        res.status(200).json({
            success: true,
            message: req.t('logout.success', { ns: 'auth' })
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? 
                error.message : 
                req.t('logout.error', { ns: 'auth' })
        });
    }
};