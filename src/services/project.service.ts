import { IProject , IUserSender , IDocumentPopulated , IProjectPopulated } from '../interfaces/project.interface';
import Project from '../models/project.model';
import Document from '../models/document.model';
import { genAlias } from '../utils/alias.util';
import { Request } from 'express';
import mongoose from 'mongoose';
import Customer from '../models/customer.model';
import Phase from '../models/phase.model';
import Report from '../models/report.model';
import dayjs from 'dayjs';

interface TimeFilter {
    type: 'month' | 'quarter';
    year: number;
    value: number;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

interface SearchFilter {
    searchTerm?: string;
    isDone?: boolean;
    timeFilter?: TimeFilter;
}

const buildSearchQuery = (filter: SearchFilter) => {
    const query: any = { isActive: true };
    // Tìm kiếm theo tên dự án
    if (filter.searchTerm) {
        query.name = { $regex: filter.searchTerm, $options: 'i' };
    }
    // Filter theo trạng thái
    if (filter.isDone !== undefined) {
        query.status = filter.isDone ? "Đã hoàn thành" : "Đang thực hiện";
    }
    // Filter theo thời gianS
    if (filter.timeFilter) {
        const timeQuery = buildTimeFilter(filter.timeFilter);
        Object.assign(query, timeQuery);
    }
    return query;
}

const buildTimeFilter = (timeFilter?: TimeFilter) => {
    if (!timeFilter) return {};

    const { type, year, value } = timeFilter;
    let startDate, endDate;

    if (type === 'month') {
        startDate = dayjs().year(year).month(value - 1).startOf('month');
        endDate = dayjs().year(year).month(value - 1).endOf('month');
    } else { // quarter
        const startMonth = (value - 1) * 3;
        startDate = dayjs().year(year).month(startMonth).startOf('month');
        endDate = dayjs().year(year).month(startMonth + 2).endOf('month');
    }

    return {
        day: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
        }
    };
}

export const getAllProject = async (req: Request) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm as string;
    const isDone = req.query.isDone ? req.query.isDone === 'true' : undefined;
    const timeFilter: TimeFilter | undefined = req.query.timeFilter ? JSON.parse(req.query.timeFilter as string) : undefined;

    const query = buildSearchQuery({
        searchTerm,
        isDone,
        timeFilter
    });

    const totalProjects = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limit);
    const skip = (page - 1) * limit;

    const projects = await Project.find(query)
        .populate({
            path: 'pm',
            select: 'name emailContact'
        })
        .populate({
            path: 'customer',
            select: 'name emailContact'
        })
        .skip(skip)
        .limit(limit)
        .sort({ day: -1 });

    if (!projects) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }

    return {
        projects,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalProjects,
            limit
        }
    };
}

export const getProjectRequest = async (req : Request , isActive : Boolean) => {
    const projectRequest = await Project.find({isActive : isActive})
    .populate({
        path : 'pm',
        select: 'name emailContact '
    })
    .populate({
        path : 'customer',
        select: 'name emailContact '
    });

    if(!projectRequest) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return projectRequest;
}


export const getProjectById = async (req: Request, pId: string) => {
    const project = await Project.findById(pId)
        .populate({
            path: 'pm',
            select: 'name emailContact phoneContact'
        })                  
        .populate({
            path: 'customer',
            select: 'name emailContact phoneContact' 
        })
        .populate({
            path: 'documentIds',
            populate: {
                path: 'sender',
                select: '_id email alias role',
                model: 'User',
            },
        }) as unknown as IProjectPopulated;

    if (!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    // Add name to sender based on role
    if (project.documentIds?.length > 0) {
        for (const doc of project.documentIds as IDocumentPopulated[]) {
            if (doc.sender) {
                const sender = doc.sender as IUserSender;
                if (!sender.name) {
                    if (sender.role === 'pm') {
                        const pmInfo = await mongoose.model('PM').findOne({ userId: sender._id }).select('name');
                        if (pmInfo && 'name' in pmInfo) {
                            sender.name = pmInfo.name;
                        }
                    } else if (sender.role === 'guest') {
                        const customerInfo = await mongoose.model('Customer').findOne({ userId: sender._id }).select('name');
                        if (customerInfo && 'name' in customerInfo) {
                            sender.name = customerInfo.name;
                        }
                    }
                }
            }
        }
    }
    const userId = req.user?._id; 
    const userRole = req.user?.role;
    if(userRole === 'guest') {
       const c =  await Customer.findOne({userId});
        if(c?._id.toString() !== project.customer._id.toString()){
             throw new Error("Ngoài quyền sở hữu tài nguyên")
        }
    }
    return project;
};

export const createProject = async (req: Request, projectData: IProject) => {
    const allProjects = await Project.find();
    const existingAliases = allProjects.map(item => item.alias);
    projectData.alias = genAlias('project', existingAliases);
    const project = await Project.create(projectData);
    if(!project) {
        throw new Error(req.t('create.error', { ns: 'project' }));
    }
    return project;
}

export const updateProjectById = async (req: Request, pId: string, projectData: IProject) => {
    const updatedProject = await Project.findByIdAndUpdate(pId, projectData, { new: true });
    if(!updatedProject){
        throw new Error(req.t('update.error', { ns: 'project' }));
    }
    return updatedProject;
}

export const deleteProjectById = async (req: Request, pId: string) => {
    // Tìm project trước khi xóa để lấy documentIds
    const project = await Project.findById(pId);
    if(!project) {
        throw new Error(req.t('delete.error', { ns: 'project' }));
    }
    // Cập nhật trạng thái isTrash của tất cả documents liên quan
    if(project.documentIds && project.documentIds.length > 0) {
        await Document.updateMany(
            { _id: { $in: project.documentIds } },
            { isTrash: true }
        );
    }
    // Xóa project
    const deletedProject = await Project.findByIdAndDelete(pId);
    return deletedProject;
}

export const activeProject = async (req : Request , pId : string , data : {status : string , isActive : boolean}) => {
    const project = await Project.findByIdAndUpdate(pId , data , {new : true});
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const getProjectByCustomerId = async (req: Request, cId: string) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm as string;
    const isDone = req.query.isDone ? req.query.isDone === 'true' : undefined;
    const timeFilter: TimeFilter | undefined = req.query.timeFilter ? JSON.parse(req.query.timeFilter as string) : undefined;

    const baseQuery = buildSearchQuery({
        searchTerm,
        isDone,
        timeFilter
    });

    const query = {
        ...baseQuery,
        customer: cId
    };

    const totalProjects = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limit);
    const skip = (page - 1) * limit;

    const projects = await Project.find(query)
        .populate({
            path: 'pm',
            select: 'name emailContact'
        })
        .populate({
            path: 'customer',
            select: 'name emailContact'
        })
        .skip(skip)
        .limit(limit)
        .sort({ day: -1 });

    if (!projects) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }

    return {
        projects,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalProjects,
            limit
        }
    };
}

export const getProjectRequestByCustomerId = async (req : Request , cId : string) => {
    const project = await Project.find({customer : cId , isActive : false})
    .populate({
        path : 'pm',
        select : 'name emailContact'
    })
    .populate({
        path : 'customer',
        select : 'name emailContact'
    })
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const addDocumentToProject = async (req : Request , pId : string , dId : string) =>{
    const updatedProject = await Project.findByIdAndUpdate(pId, 
        {
            $push : {documentIds : dId},
        }, 
        {new : true}
    ).populate('documentIds');
    if(!updatedProject){
        throw new Error(req.t('notFound' , {ns : 'project'}));
    }
    return updatedProject;

}

export const endingProject = async (req : Request , pId : string , data : {status : string , isActive : boolean}) => {
    const project = await Project.findByIdAndUpdate(pId , data , {new : true});
    if(!project) {
        throw new Error(req.t('notFound', { ns: 'project' }));
    }
    return project;
}

export const projectStatisticById = async (req: Request, projectId: string) => {
  const project = await Project.findById(projectId)
    .populate({ path: 'pm', select: 'name alias emailContact' })
    .populate({ path: 'customer', select: 'name alias emailContact' });

  if (!project) throw new Error("Không tìm thấy dự án");

  const startDate = dayjs(project.day);
  const phaseInProject = await Phase.findOne({ projectId });
  const phaseNum = phaseInProject?.phases.length || 0;
  const estimateDate = phaseInProject?.phases[phaseNum - 1]?.day
    ? dayjs(phaseInProject.phases[phaseNum - 1].day)
    : undefined;

  const allReports = await Report.find({ projectId }).select('createdAt sender').populate({
    path: 'sender',
    select: 'role',
  });

  const customerReports = allReports.filter(
    (r) => (r.sender as any)?.role === 'guest'
  );
  const pmReports = allReports.filter(
    (r) => (r.sender as any)?.role === 'pm' || (r.sender as any)?.role === 'admin'
  );

  const now = dayjs();
  const daysInProgress = now.diff(startDate, 'day');
  const endDate = estimateDate || now;
  const weekCount = Math.ceil(endDate.diff(startDate, 'day') / 7);

  const getWeekIndex = (date: Date) => {
    return Math.floor(dayjs(date).diff(startDate, 'day') / 7);
  };

  const pmReportByWeek = Array(weekCount).fill(0);
  const customerReportByWeek = Array(weekCount).fill(0);

  pmReports.forEach((r) => {
    const idx = getWeekIndex(r.day);
    if (idx >= 0 && idx < weekCount) pmReportByWeek[idx]++;
  });
  customerReports.forEach((r) => {
    const idx = getWeekIndex(r.day);
    if (idx >= 0 && idx < weekCount) customerReportByWeek[idx]++;
  });

  return {
    projectName : project.name,
    startDate : startDate,
    estimateDate : estimateDate,
    pm : project.pm,
    customer : project.customer,
    daysInProgress,
    pmReportCount: pmReports.length,
    customerReportCount: customerReports.length,
    pieChart : {
        currentPhase : phaseInProject?.currentPhase,
        phaseNum : phaseNum
    },
    chart: {
      weekLabels: Array.from({ length: weekCount }, (_, i) => `Tuần ${i + 1}`),
      pmReportByWeek,
      customerReportByWeek,
    },
  };
};

export const projectStatistic = async () => {
    try {
        // if(req.user?.role === 'guest') return;
        const totalActiveProject =  await Project.countDocuments({isActive:true});
        const totalProject = await Project.countDocuments();
        const totalInActiveProject = totalProject - totalActiveProject;
        let percentActive = 0;
        let percentInActive = 0;
        if(totalProject > 0) {
            percentActive = Math.round(totalActiveProject/totalProject * 100);
            percentInActive = 100 - percentActive;
        }
        return {
            totalProject,
            totalActiveProject,
            totalInActiveProject,
            percentActive,
            percentInActive
        }
    } catch (error : any) {
        throw new Error(error.message);
    }
}

export const projectStatisticByGuest = async (req : Request) => {
    try {
        const userId = req.user?._id;
        const userRole = req.user?.role;
        if(userRole !== 'guest') return;
        const c = await Customer.findOne({userId : userId});
        console.log("Custoemr" , c?._id);
        const totalProject = await Project.countDocuments({customer : c?._id});
        const totalActiveProject = await Project.countDocuments({customer : c?._id , isActive : true})
        const totalInActiveProject = totalProject - totalActiveProject;       
        let percentActive = 0;
        let percentInActive = 0;
        if(totalProject > 0) {
            percentActive = Math.round(totalActiveProject/totalProject * 100);
            percentInActive = 100 - percentActive;
        }
        return {
            totalProject,
            totalActiveProject,
            totalInActiveProject,
            percentActive,
            percentInActive
        }
    } catch (error : any) {
        throw new Error(error.message);
    }
}