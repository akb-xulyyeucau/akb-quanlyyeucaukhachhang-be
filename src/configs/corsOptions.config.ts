import dotenv from 'dotenv';
dotenv.config()
const FE_URL = process.env.FE_URL;
export const corsOptions = {
  origin: FE_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
