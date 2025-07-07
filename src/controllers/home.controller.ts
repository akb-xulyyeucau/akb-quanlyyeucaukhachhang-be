import {Request , Response} from 'express';
import {
    adminStatistic,
} from '../services/home.service';

export const adminStatisticController = async (req : Request , res : Response ) => {
    try {
        const {mode = 'month', startDate, endDate} = req.query;
        
        // Kiểm tra và chuyển đổi ngày
        const start = startDate ? new Date(startDate as string) : new Date();
        const end = endDate ? new Date(endDate as string) : undefined;

        // Validate dates
        if (end && start > end) {
            res.status(400).json({
                success: false,
                message: "Ngày bắt đầu không thể sau ngày kết thúc"
            });
            return;
        }
        
        const data = await adminStatistic(
            req, 
            mode as 'month' | 'quarter' | 'year',
            start,
            end
        );

        res.status(200).json({
            success : true,
            message : "Lấy dữ liệu thống kê thành công",
            data : data,
        });
    } catch (error : any) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
}