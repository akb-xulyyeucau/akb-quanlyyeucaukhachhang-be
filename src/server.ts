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

dotenv.config();

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.urlencoded({ extended: true }));

// Add language detection middleware
app.use('/api/:lng/', i18nextMiddleware.handle(i18next));

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

connectDB();

cronJob();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
