import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { StringValue } from "ms";
dotenv.config();

export const genAccessToken = (userId: string): string => {
    const payload = { userId };
    const expiresIn = (process.env.ACCESS_TOKEN_EXPIRE ?? '15m') as StringValue;
    const options: SignOptions = {
        expiresIn, 
    };
    const secret: Secret = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
    return jwt.sign(payload, secret, options);
};

export const genRefreshToken = (userId: string): string => {
    const payload = { userId };
    const expiresIn = (process.env.REFRESH_TOKEN_EXPIRE ?? '30d') as StringValue;
    const options: SignOptions = {
        expiresIn, 
    };
    const secret: Secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    return jwt.sign(payload, secret, options);
}