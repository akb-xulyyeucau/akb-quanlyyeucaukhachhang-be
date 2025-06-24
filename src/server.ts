import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {corsOptions} from './configs/corsOptions.config';
import {cronJob} from './configs/cronjob';
import cookieParser from "cookie-parser";
import connectDB from './configs/db.config';
import i18next from './configs/i18n.config';
import i18nextMiddleware from 'i18next-http-middleware';
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route"; 
import customerRoutes from "./routes/customer.route";
import pmRoutes from "./routes/pm.route";
import projectRoute from './routes/project.route'; 
import path from "path";
import documentRoute from './routes/document.route';
import phaseRoute from './routes/phase.route';
import reportRoute from './routes/report.route';
import mailRoute from './routes/mail.route';
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  ...corsOptions,
  exposedHeaders: ['Content-Disposition', 'Content-Type'] // Add this for file downloads
}));

// Static file serving with CORS enabled
app.use("/uploads", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FE_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    // Set proper content type for PDF files
    if (filePath.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
    }
  }
}));

// Add language detection middleware
app.use('/api/:lng/', i18nextMiddleware.handle(i18next));

// Routes
app.get("/", (_req, res) => {
  res.send("Server is running with TypeScript!");
});
app.use("/api/:lng/user", userRoutes);
app.use("/api/:lng/auth", authRoutes);
app.use("/api/:lng/customer", customerRoutes);
app.use("/api/:lng/pm", pmRoutes);
app.use("/api/:lng/project" , projectRoute);
app.use("/api/:lng/document", documentRoute);
app.use("/api/:lng/phase", phaseRoute);
app.use("/api/:lng/report", reportRoute);
app.use("/api/:lng/mail", mailRoute);


connectDB();

cronJob();

const PORT = process.env.PORT || 5051;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
