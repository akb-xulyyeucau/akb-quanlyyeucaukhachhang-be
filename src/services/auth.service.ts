import User from '../models/user.model';
import {genAccessToken , genRefreshToken} from '../utils/jwt.util';
import {  IUserDocument } from '../interfaces/user.interface';
import i18next from 'i18next';

export const loginUserService = async (email: string, password: string) => {
    const user = await User.findOne({ email }) as IUserDocument & { _id: any };

    if (!user) {
        throw new Error(i18next.t('auth:login_failed'));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new Error(i18next.t('auth:login_failed'));
    }
    const accessToken = genAccessToken(user._id.toString());
    const refreshToken = genRefreshToken(user._id.toString());

    return {
        accessToken,
        refreshToken,
        user,
    };
};

export const refreshTokenServices = async (userId : string) => {
    const user = await User.findById(userId)as IUserDocument & { _id: any };
    if(!user){
        throw new Error(i18next.t('user:not_found'));
    }
    const accessToken = genAccessToken(user?._id.toString());
    return { accessToken , user};
}