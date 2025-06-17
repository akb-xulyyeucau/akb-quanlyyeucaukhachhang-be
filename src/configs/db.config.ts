import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
const isCloud = process.env.IS_CLOUD_MONGO;
const connectDB = async () => {
   if(isCloud === "true"){
    const uri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;
     if (!uri || !dbName) {
    console.error("Missing MONGO_URI or DB_NAME in environment variables");
    process.exit(1);
  }
    try {
        await mongoose.connect(uri as string , {dbName});
        console.log(`Connected to MongoDB Database: ${dbName}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);    
        
    }
   }else{
    try {
        await mongoose.connect(process.env.MONGO_URI_CLOUD as string);
        console.log('MongoDB connected');
      } catch (err:any) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
      }
   }
}
export default connectDB;