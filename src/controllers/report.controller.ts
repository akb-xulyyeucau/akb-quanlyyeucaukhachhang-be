import { Request, Response } from 'express';
import { createReport, getReportsByProject, getReportById, deleteReport, updateReport } from '../services/report.service';
import { uploadMultiple } from '../middlewares/upload.middleware';
import { IFile } from '../interfaces/document.interface';
import { IReport } from '../interfaces/report.interface';
import { ObjectId } from 'mongoose';
import { queueMail, EmailTemplates } from '../mails/mail';
import { IUserDocument } from '../interfaces/user.interface';
import Project from '../models/project.model';

// Hàm xử lý tên file tiếng Việt
const decodeVietnameseFilename = (filename: string): string => {
    try {
        return Buffer.from(filename, 'binary').toString('utf8');
    } catch (error) {
        return filename;
    }
};

export const createReportController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();

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
            // Transform uploaded files into IFile format with Vietnamese filename support
            const uploadedFiles: IFile[] = files.map(file => ({
                originalName: decodeVietnameseFilename(file.originalname),
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

            // Gửi mail thông báo khi tạo báo cáo mới
            const project = await Project.findById(projectId).populate('customer');
            if (project && (project.customer as any).emailContact) {
                await queueMail(
                    {
                        to: (project.customer as any).emailContact,
                        ...EmailTemplates.REPORT_ADDED(project.name, mainContent),
                        priority: 2 // Ưu tiên trung bình cho thông báo báo cáo mới
                    },
                    userId,
                    req
                );
            }

            res.status(201).json({
                success: true,
                message : req.t('create.success', { ns: 'report' }),
                data: report
            });
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getProjectReportsController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        // Decode and handle query parameters properly
        const search = req.query.search ? decodeURIComponent(req.query.search as string) : "";
        const isCustomer = req.query.isCustomer as string || "";
        const result = await getReportsByProject(req, projectId, {
            search: search,
            isCustomer: isCustomer
        });

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        console.error('Error in getProjectReportsController:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            data: []
        });
    }
};

export const getReportDetailController = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const report = await getReportById(req ,reportId);
        res.status(200).json({
            success: true,
            message: req.t('getDetail.success', { ns: 'report' }),
            data: report
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateReportController = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const userId = (user._id as unknown as string).toString();
        const { reportId } = req.params;
        
        // Handle file upload
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            // Get new files if any
            const files = req.files as Express.Multer.File[] || [];
            
            // Transform new uploaded files into IFile format with Vietnamese filename support
            const newUploadedFiles: IFile[] = files.map(file => ({
                originalName: decodeVietnameseFilename(file.originalname),
                path: file.filename,
                size: file.size,
                type: file.mimetype
            }));

            // Get update data from request body
            const { mainContent, projectId, subContent } = req.body;
            let parsedSubContent;
            
            try {
                parsedSubContent = JSON.parse(subContent);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subContent format'
                });
            }

            // Map new files to their respective subContent sections
            parsedSubContent.forEach((content: any) => {
                // Keep existing files
                const existingFiles = content.files || [];
                
                // Add new files if fileIndices is provided
                if (content.fileIndices && content.fileIndices.length > 0) {
                    const newFiles = content.fileIndices.map((index: number) => newUploadedFiles[index]).filter(Boolean);
                    content.files = [...existingFiles, ...newFiles];
                } else {
                    content.files = existingFiles;
                }
                
                // Remove fileIndices as it's not needed in the database
                delete content.fileIndices;
            });

            // Create report update data
            const reportData: IReport = {
                mainContent,
                sender: req.user?._id as ObjectId,
                projectId,
                subContent: parsedSubContent,
                day: new Date()
            };

            const updatedReport = await updateReport(req, reportId, reportData);

            // Gửi mail thông báo khi cập nhật báo cáo
            const project = await Project.findById(projectId).populate('customer');
            if (project && (project.customer as any).emailContact) {
                await queueMail(
                    {
                        to: (project.customer as any).emailContact,
                        ...EmailTemplates.REPORT_ADDED(project.name, mainContent),
                        priority: 2 // Ưu tiên trung bình cho thông báo cập nhật báo cáo
                    },
                    userId,
                    req
                );
            }

            res.status(200).json({
                success: true,
                message : req.t('update.success', { ns: 'report' }),
                data: updatedReport
            });
        });
    } catch (error: any) {
        res.status(400).json({
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
            message: req.t('delete.success', { ns: 'report' }),
            data: deletedReport
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
