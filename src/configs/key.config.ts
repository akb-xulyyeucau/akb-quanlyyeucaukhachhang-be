import dotenv from 'dotenv';

dotenv.config();
const isDev  = process.env.NODE_ENV
export const envKey = {
    app : {
        port : process.env.PORT, 
    }
}