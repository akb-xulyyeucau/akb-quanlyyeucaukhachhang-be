import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;
    // const cloudUri = process.env.MONGO_CLOUD_URI;
     if (!uri || !dbName) {
    console.error("Missing MONGO_URI or DB_NAME in environment variables");
    process.exit(1);
  }
    try {
        await mongoose.connect(uri , {dbName});
        console.log(`Connected to MongoDB Database: ${dbName}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);    
        
    }
}
export default connectDB;