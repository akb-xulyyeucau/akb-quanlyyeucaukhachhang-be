import Project from '../models/project.model';
import Customer from '../models/customer.model';
import Phase from '../models/phase.model';
import Feedback from '../models/feedback.model';
import Report from '../models/report.model';
import User from '../models/user.model';
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

interface TopReporter {
  _id: Types.ObjectId;
  totalReports: number;
  customerName: string;
}

interface ChangeStats {
  current: number;
  previous: number;
  percentageChange: number;
}

interface StatisticResponse {
  totalProjects: number;
  totalProjectsChange: ChangeStats;
  newRequests: number;
  inProgressProjects: number;
  completedProjects: number;
  completedProjectsChange: ChangeStats;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  projects: ProjectWithPhase[];
  ratingStats: any;
  reportStats: {
    topReporters: TopReporter[];
  }
}

interface CustomerStatisticResponse {
  totalProjects: number;
  totalProjectsChange: ChangeStats;
  newRequests: number;
  inProgressProjects: number;
  completedProjects: number;
  completedProjectsChange: ChangeStats;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  projects: ProjectWithPhase[];
}

const calculatePreviousDateRange = (start: Date, end: Date): { prevStart: Date; prevEnd: Date } => {
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1); // Ngày trước startDate
  const prevStart = new Date(prevEnd.getTime() - duration); // Lùi về khoảng thời gian bằng với duration
  return { prevStart, prevEnd };
};

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const adminStatistic = async (
  req: Request,
  mode: 'month' | 'quarter' | 'year',
  startDate: Date,
  endDate?: Date,
  topN: number = 5
): Promise<StatisticResponse> => {
  try {
    const userRole = req.user?.role;
    if (userRole === 'guest') throw new Error("Ngoài quyền truy cập!");

    // Tính toán khoảng thời gian hiện tại
    const { startDate: start, endDate: end } = calculateDateRange(mode, startDate, endDate);
    
    // Tính toán khoảng thời gian trước đó
    const { prevStart, prevEnd } = calculatePreviousDateRange(start, end);

    // Tạo label định dạng thời gian
    const periodLabel = formatPeriodLabel(mode, start, end);

    // Điều kiện tìm kiếm theo khoảng thời gian hiện tại
    const currentDateRange = {
      day: {
        $gte: start,
        $lte: end
      }
    };

    // Điều kiện tìm kiếm theo khoảng thời gian trước đó
    const previousDateRange = {
      day: {
        $gte: prevStart,
        $lte: prevEnd
      }
    };

    const [
      totalProjects,
      previousTotalProjects,
      newRequests,
      inProgressProjects,
      completedProjects,
      previousCompletedProjects,
      rawProjects
    ] = await Promise.all([
      // Tổng số project trong khoảng thời gian hiện tại
      Project.countDocuments({ ...currentDateRange }),

      // Tổng số project trong khoảng thời gian trước đó
      Project.countDocuments({ ...previousDateRange }),

      // Số yêu cầu mới (chưa kích hoạt)
      Project.countDocuments({
        ...currentDateRange,
        isActive: false,
        status: "Chưa kích hoạt"
      }),

      // Số project đang thực hiện
      Project.countDocuments({
        ...currentDateRange,
        status: "Đang thực hiện"
      }),

      // Số project đã hoàn thành trong khoảng thời gian hiện tại
      Project.countDocuments({
        ...currentDateRange,
        status: "Đã hoàn thành"
      }),

      // Số project đã hoàn thành trong khoảng thời gian trước đó
      Project.countDocuments({
        ...previousDateRange,
        status: "Đã hoàn thành"
      }),

      // Lấy danh sách projects trong khoảng thời gian hiện tại
      Project.find(currentDateRange)
        .populate<{ customer: { _id: Types.ObjectId; name: string } }>('customer', 'name')
        .populate<{ pm: { _id: Types.ObjectId; name: string } }>('pm', 'name')
        .lean()
        .select('name status day isActive customer pm')
        .sort({ day: -1 })
    ]);

    // Tính toán phần trăm thay đổi
    const totalProjectsChange: ChangeStats = {
      current: totalProjects,
      previous: previousTotalProjects,
      percentageChange: calculatePercentageChange(totalProjects, previousTotalProjects)
    };

    const completedProjectsChange: ChangeStats = {
      current: completedProjects,
      previous: previousCompletedProjects,
      percentageChange: calculatePercentageChange(completedProjects, previousCompletedProjects)
    };

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

    const rating = { 
      total: await Feedback.countDocuments(),
      oneStar: await Feedback.countDocuments({rating: '1'}),
      twoStar: await Feedback.countDocuments({rating: '2'}),
      threeStar: await Feedback.countDocuments({rating: '3'}),
      fourStar: await Feedback.countDocuments({rating: '4'}),
      fiveStar: await Feedback.countDocuments({rating: '5'}),
    };

    // Lấy top N users có nhiều report nhất và map với customer
    const topReporters = await Report.aggregate([
      {
        $match: currentDateRange
      },
      {
        $group: {
          _id: '$sender',
          totalReports: { $sum: 1 }
        }
      },
      {
        $sort: { totalReports: -1 }
      },
      {
        $limit: topN
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $match: {
          'userInfo.role': 'guest'
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'userInfo._id',
          foreignField: 'userId',
          as: 'customerInfo'
        }
      },
      {
        $unwind: {
          path: '$customerInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: '$userInfo._id',
          totalReports: 1,
          customerName: { $ifNull: ['$customerInfo.name', 'Chưa có thông tin'] }
        }
      }
    ]);

    return {
      totalProjects,
      totalProjectsChange,
      newRequests,
      inProgressProjects,
      completedProjects,
      completedProjectsChange,
      periodStart: start,
      periodEnd: end,
      periodLabel,
      projects,
      ratingStats: rating,
      reportStats: {
        topReporters
      }
    };

  } catch (error) {
    throw error;
  }
};


export const customerStatistic = async (
  req: Request,
  mode: 'month' | 'quarter' | 'year' = 'month',
  startDate: Date = new Date(),
  endDate?: Date
): Promise<CustomerStatisticResponse> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if(userRole !== 'guest') throw new Error("Ngoài quyền truy cập!");
    
    const customer = await Customer.findOne({userId});
    if(!customer) throw new Error("Không tìm thấy thông tin khách hàng!");
    const customerId = customer._id;

    // Tính toán khoảng thời gian hiện tại
    const { startDate: start, endDate: end } = calculateDateRange(mode, startDate, endDate);
    
    // Tính toán khoảng thời gian trước đó
    const { prevStart, prevEnd } = calculatePreviousDateRange(start, end);

    // Tạo label định dạng thời gian
    const periodLabel = formatPeriodLabel(mode, start, end);

    // Điều kiện tìm kiếm theo khoảng thời gian hiện tại và customerId
    const currentDateRange = {
      day: {
        $gte: start,
        $lte: end
      },
      customer: customerId
    };

    // Điều kiện tìm kiếm theo khoảng thời gian trước đó và customerId
    const previousDateRange = {
      day: {
        $gte: prevStart,
        $lte: prevEnd
      },
      customer: customerId
    };

    const [
      totalProjects,
      previousTotalProjects,
      newRequests,
      inProgressProjects,
      completedProjects,
      previousCompletedProjects,
      rawProjects
    ] = await Promise.all([
      // Tổng số project trong khoảng thời gian hiện tại
      Project.countDocuments({ ...currentDateRange }),

      // Tổng số project trong khoảng thời gian trước đó
      Project.countDocuments({ ...previousDateRange }),

      // Số yêu cầu mới (chưa kích hoạt)
      Project.countDocuments({
        ...currentDateRange,
        isActive: false,
        status: "Chưa kích hoạt"
      }),

      // Số project đang thực hiện
      Project.countDocuments({
        ...currentDateRange,
        status: "Đang thực hiện"
      }),

      // Số project đã hoàn thành trong khoảng thời gian hiện tại
      Project.countDocuments({
        ...currentDateRange,
        status: "Đã hoàn thành"
      }),

      // Số project đã hoàn thành trong khoảng thời gian trước đó
      Project.countDocuments({
        ...previousDateRange,
        status: "Đã hoàn thành"
      }),

      // Lấy danh sách projects trong khoảng thời gian hiện tại
      Project.find(currentDateRange)
        .populate<{ customer: { _id: Types.ObjectId; name: string } }>('customer', 'name')
        .populate<{ pm: { _id: Types.ObjectId; name: string } }>('pm', 'name')
        .lean()
        .select('name status day isActive customer pm')
        .sort({ day: -1 })
    ]);

    // Tính toán phần trăm thay đổi
    const totalProjectsChange: ChangeStats = {
      current: totalProjects,
      previous: previousTotalProjects,
      percentageChange: calculatePercentageChange(totalProjects, previousTotalProjects)
    };

    const completedProjectsChange: ChangeStats = {
      current: completedProjects,
      previous: previousCompletedProjects,
      percentageChange: calculatePercentageChange(completedProjects, previousCompletedProjects)
    };

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

    return {
      totalProjects,
      totalProjectsChange,
      newRequests,
      inProgressProjects,
      completedProjects,
      completedProjectsChange,
      periodStart: start,
      periodEnd: end,
      periodLabel,
      projects
    };

  } catch (error) {
    throw error;
  }
};