import dotenv from 'dotenv';
dotenv.config()
import {envKey} from './key.config';

const isDev = envKey.app.env === "development";
const FE_URL = envKey.fe.url;

export const corsOptions = {
  origin: isDev ? FE_URL : [FE_URL, envKey.fe.url_prod].filter(Boolean), // Filter out empty values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  // Additional security headers for production
  ...(isDev ? {} : {
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
};
