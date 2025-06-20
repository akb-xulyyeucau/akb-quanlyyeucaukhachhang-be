import { Request, Response } from 'express';
import { createReport, getReportsByProject, getReportById , deleteReport} from '../services/report.service';
import { uploadMultiple } from '../middlewares/upload.middleware';
import { IFile } from '../interfaces/document.interface';
import { IReport } from '../interfaces/report.interface';
import { ObjectId } from 'mongoose';

export const createReportController = async (req: Request, res: Response) => {
    try {
        // Handle file upload
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }
            // Transform uploaded files into IFile format
            const uploadedFiles: IFile[] = files.map(file => ({
                originalName: file.originalname,
                path: file.filename,
                size: file.size,
                type: file.mimetype
            }));
            // Get subContent data from request body
            const { mainContent, projectId, subContent } = req.body;
            const parsedSubContent = JSON.parse(subContent);
            // Map files to their respective subContent sections
            parsedSubContent.forEach((content: any) => {
                content.files = uploadedFiles.filter(file => 
                    content.fileIndices.includes(uploadedFiles.indexOf(file))
                );
            });
            // Create report data
            const reportData : IReport = {
                mainContent,
                sender: req.user?._id as ObjectId,
                projectId,
                subContent: parsedSubContent,
                day: new Date()
            };

            const report = await createReport(req, reportData);
            res.status(201).json({
                success: true,
                data: report
            });
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProjectReportsController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const reports = await getReportsByProject(req , projectId);
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getReportDetailController = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const report = await getReportById(req ,reportId);
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteReportController = async (req : Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const deletedReport = await deleteReport(req, reportId);
        res.status(200).json({
            success: true,
            data: deletedReport
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
