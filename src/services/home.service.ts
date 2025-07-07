import Project from '../models/project.model';
import Customer from '../models/customer.model';
import Phase from '../models/phase.model';
import Feedback from '../models/feedback.model';
import Report from '../models/report.model';
import { Request } from 'express';
import { Types } from 'mongoose';
import { calculateDateRange, formatPeriodLabel } from '../utils/home.util';

interface PopulatedFields {
  customer: { _id: Types.ObjectId; name: string };
  pm: { _id: Types.ObjectId; name: string };
}

interface ProjectWithPhase extends PopulatedFields {
  _id: Types.ObjectId;
  name: string;
  status: string;
  day: Date;
  isActive: boolean;
  currentPhase: number;
  totalPhases: number;
}

interface StatisticResponse {
  totalProjects: number;
  newRequests: number;
  inProgressProjects: number;
  completedProjects: number;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  projects: ProjectWithPhase[];
  allRating: number;
}


export const adminStatistic = async (
  req: Request,
  mode: 'month' | 'quarter' | 'year',
  startDate: Date,
  endDate?: Date
): Promise<StatisticResponse> => {
  try {
    const userRole = req.user?.role;
    if (userRole === 'guest') throw new Error("Ngoài quyền truy cập!");

    // Tính toán khoảng thời gian
    const { startDate: start, endDate: end } = calculateDateRange(mode, startDate, endDate);
    
    // Tạo label định dạng thời gian
    const periodLabel = formatPeriodLabel(mode, start, end);

    // Điều kiện tìm kiếm theo khoảng thời gian
    const dateRange = {
      day: {
        $gte: start,
        $lte: end
      }
    };

    const [
      totalProjects,
      newRequests,
      inProgressProjects,
      completedProjects,
      rawProjects
    ] = await Promise.all([
      // Tổng số project trong khoảng thời gian
      Project.countDocuments({ ...dateRange }),
      // Số yêu cầu mới (chưa kích hoạt)
      Project.countDocuments({
        ...dateRange,
        isActive: false,
        status: "Chưa kích hoạt"
      }),
      // Số project đang thực hiện
      Project.countDocuments({
        ...dateRange,
        status: "Đang hoạt động"
      }),
      // Số project đã hoàn thành
      Project.countDocuments({
        ...dateRange,
        status: "Đã hoàn thành"
      }),
      // Lấy danh sách projects trong khoảng thời gian
      Project.find(dateRange)
        .populate<{ customer: { _id: Types.ObjectId; name: string } }>('customer', 'name')
        .populate<{ pm: { _id: Types.ObjectId; name: string } }>('pm', 'name')
        .lean()
        .select('name status day isActive customer pm')
        .sort({ day: -1 })
    ]);

    // Lấy thông tin phase cho các projects
    const projectPhases = await Phase.find({
      projectId: { $in: rawProjects.map(p => p._id) }
    }).select('projectId phases currentPhase').lean();

    // Tạo map để dễ dàng truy cập thông tin phase
    const phaseMap = new Map(
      projectPhases.map(phase => [phase.projectId.toString(), phase])
    );

    // Transform projects để thêm thông tin phase
    const projects: ProjectWithPhase[] = rawProjects.map(project => {
      const phaseInfo = phaseMap.get(project._id.toString());
      return {
        _id: project._id,
        name: project.name,
        status: project.status,
        day: project.day,
        isActive: project.isActive,
        customer: project.customer as PopulatedFields['customer'],
        pm: project.pm as PopulatedFields['pm'],
        currentPhase: phaseInfo ? phaseInfo.currentPhase : 0,
        totalPhases: phaseInfo ? phaseInfo.phases.length : 0
      };
    });

    const allRating = await Feedback.countDocuments();

    return {
      totalProjects,
      newRequests,
      inProgressProjects,
      completedProjects,
      periodStart: start,
      periodEnd: end,
      periodLabel,
      projects,
      allRating,
    };

  } catch (error) {
    throw error;
  }
};