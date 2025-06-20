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
    .populate('sender', 'alias email')
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

export const updateReport = async (req : Request , reportId : string , reportData:IReport) => {
    const {mainContent , day , sender , projectId , subContent} = reportData;
    const report = await Report.findByIdAndUpdate(reportId, {
        mainContent,
        day,
        sender,
        projectId,
        subContent
    }, { new: true });
    if (!report) {
        throw new Error(req.t('notFound', { ns: 'report' }));
    }
    return report;
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

