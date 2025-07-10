import dotenv from 'dotenv';

dotenv.config();
const isDev  = process.env.NODE_ENV === 'development'
export const envKey = {
    app : {
        port : process.env.PORT, 
        env : process.env.NODE_ENV
    },
    db : {
        uri : isDev? process.env.MONGO_URI : process.env.MONGO_URI_CLOUD,
        name: isDev? process.env.DB_NAME : process.env.DB_NAME_CLOUD,
    },
    jwt : {
        access_secret : process.env.JWT_ACCESS_SECRET || "this is access",
        access_expire : process.env.ACCESS_TOKEN_EXPIRE || "1d",
        refresh_secret : process.env.JWT_REFRESH_SECRET || "this is refresh",
        refresh_expire : process.env.REFRESH_TOKEN_EXPIRE || "7d"
    },
    common : {
        cron_doc : process.env.CRON_JOB_DOCUMENT_EXPIRED_TIME || '120',
        cron_project : process.env.CRON_JOB_PROJECT_EXPIRED_DAYS || '7',
        cron_complete : process.env.CRON_JOB_COMPLETED_PROJECT_EXPIRED_DAYS|| '14'
    },
    cookie : {
        
    },
    fe : {
        url : isDev ? process.env.FE_URL : process.env.FE_URL_PORD
    }

}