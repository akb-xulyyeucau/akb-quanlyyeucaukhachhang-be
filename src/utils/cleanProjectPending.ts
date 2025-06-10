import cron from 'node-cron'
import Project from '../models/project.model';
import dotenv from 'dotenv';

dotenv.config();

// Thời gian hết hạn cho dự án chưa kích hoạt (mặc định 1 ngày)
const PENDING_EXPIRED_DAYS = parseInt(process.env.CRON_JOB_PROJECT_EXPIRED_DAYS || '1');
// Thời gian hết hạn cho dự án đã hoàn thành (mặc định 30 ngày)
const COMPLETED_EXPIRED_DAYS = parseInt(process.env.CRON_JOB_COMPLETED_PROJECT_EXPIRED_DAYS || '3');

const cleanProjects = async () => {
    try {
        const pendingExpiredTime = new Date(Date.now() - PENDING_EXPIRED_DAYS * 24 * 60 * 60 * 1000);
        const completedExpiredTime = new Date(Date.now() - COMPLETED_EXPIRED_DAYS * 24 * 60 * 60 * 1000);

        // Xóa dự án chưa kích hoạt
        const pendingProjects = await Project.deleteMany({
            status: "Chưa kích hoạt",
            createdAt: { $lt: pendingExpiredTime }
        });

        // Xóa dự án đã hoàn thành
        const completedProjects = await Project.deleteMany({
            status: "Đã hoàn thành",
            createdAt: { $lt: completedExpiredTime }
        });

        console.log(`Đã xóa ${pendingProjects.deletedCount} dự án chưa kích hoạt`);
        console.log(`Đã xóa ${completedProjects.deletedCount} dự án đã hoàn thành`);
    } catch (error) {
        console.error('Lỗi khi xóa dự án:', error);
        throw error;
    }
}

export const cronJobCleanProject = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('Bắt đầu quét và xóa dự án hết hạn...');
        cleanProjects();
    });
}