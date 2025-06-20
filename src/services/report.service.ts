import Report from '../models/report.model';
import { IReport, ISubContent } from '../interfaces/report.interface';
import { Request } from 'express';
import { IFile } from '../interfaces/document.interface';
import fs from 'fs';
import path from 'path';
const uploadDir = path.join(__dirname, "..", "uploads");    
export const createReport = async (req: Request, reportData: IReport) => {
    try {
        const {
            mainContent,
            day,
            sender,
            projectId,
            subContent
        } = reportData;
        // Parse and validate subContent
        const parsedSubContent: ISubContent[] = subContent.map(content => {
            const files: IFile[] = content.files.map(file => ({
                originalName: file.originalName,
                path: file.path,
                size: file.size,
                type: file.type
            }));

            return {
                contentName: content.contentName,
                files: files
            };
        });

        // Create new report
        const report = await Report.create({
            mainContent,
            day: day || new Date(),
            sender,
            projectId,
            subContent: parsedSubContent
        });

        // Populate sender information
        const populatedReport = await Report.findById(report._id)
            .populate('sender', 'alias email')
            .populate('projectId', 'name alias');

        return populatedReport;
    } catch (error) {
        throw error;
    }
}

// Get all reports for a project
export const getReportsByProject = async (req : Request,projectId: string) => {
  const reports = await Report.find({projectId})
    .populate('sender', 'alias email role')
    .populate('projectId', 'name alias');
  if (!reports || reports.length === 0) {
      throw new Error(req.t('notFound', { ns: 'report' }));
  }
  return reports;
}

// Get report detail
export const getReportById = async (req: Request, reportId: string) => {
   const report = await Report.findById(reportId)
    .populate('sender', 'alias email')
    .populate('projectId', 'name alias');
   if (!report) {
       throw new Error(req.t('notFound', { ns: 'report' }));
   }
   return report;   
}

export const updateReport = async (req: Request, reportId: string, reportData: IReport) => {
    // Declare variable outside try-catch block
    let existingFilePaths: string[] = [];
    
    try {
        if (!reportData || !reportData.mainContent || !reportData.projectId || !reportData.subContent || !reportData.sender) {
            throw new Error(req.t('invalidData', { ns: 'report' }));
        }

        // Get existing report
        const existingReport = await Report.findById(reportId);
        if (!existingReport) {
            throw new Error(req.t('notFound', { ns: 'report' }));
        }

        // Get all existing file paths
        existingFilePaths = existingReport.subContent.flatMap(content => 
            content.files.map(file => file.path)
        );
        // Get all new file paths from update data
        const newFilePaths = reportData.subContent.flatMap(content => 
            content.files.map(file => file.path)
        );
        // Find files that need to be deleted (exist in old but not in new)
        const filesToDelete = existingFilePaths.filter(path => !newFilePaths.includes(path));

        // Delete files that are no longer needed
        for (const filePath of filesToDelete) {
            const fullPath = path.join(uploadDir, path.basename(filePath));
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log('Successfully deleted file:', fullPath);
                } catch (error) {
                    console.error('Error deleting file:', fullPath, error);
                }
            }
        }

        // Update report in database
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            {
                mainContent: reportData.mainContent,
                day: reportData.day,
                sender: reportData.sender,
                projectId: reportData.projectId,
                subContent: reportData.subContent
            },
            { 
                new: true,
                runValidators: true 
            }
        ).populate('sender', 'alias email')
         .populate('projectId', 'name alias');

        if (!updatedReport) {
            throw new Error(req.t('updateFailed', { ns: 'report' }));
        }

        return updatedReport;
    } catch (error) {
        // If there's an error, we should try to clean up any new files that were uploaded
        const newFiles = reportData.subContent.flatMap(content => 
            content.files.filter(file => !existingFilePaths.includes(file.path))
        );

        for (const file of newFiles) {
            const fullPath = path.join(uploadDir, path.basename(file.path));
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log('Cleaned up new file after error:', fullPath);
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', fullPath, cleanupError);
                }
            }
        }

        throw error;
    }
}

export const deleteReport = async (req : Request , reportId : string) => {
   const deletedReport = await Report.findByIdAndDelete(reportId);
   if(!deletedReport){
         throw new Error(req.t('notFound', { ns: 'report' }));
   }
   for (const subContent of deletedReport.subContent) {
       for (const file of subContent.files) {
           const filePath = path.join(uploadDir , path.basename(file.path));
           if (fs.existsSync(filePath)) {
               fs.unlinkSync(filePath);
               console.log("Deleted file successfully: ", filePath);
           }
       }
   }
   return deletedReport;
}
