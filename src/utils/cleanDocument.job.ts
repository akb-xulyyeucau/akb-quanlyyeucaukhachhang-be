import cron from 'node-cron';
import Document from '../models/document.model';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
const expiredTime = new Date(Date.now() - parseInt(process.env.CRON_JOB_DOCUMENT_EXPIRED_TIME || '30') * 60 * 1000);
const uploadDir = path.join(__dirname, "..", "uploads");

const cleanDocumentJob = async () => {
    try {
        // Tìm các document cần xóa trước
        const documentsToDelete = await Document.find({isTrash: true, day: {$lt: expiredTime}});
        // Xóa các file trong thư mục upload
        for (const doc of documentsToDelete) {
            for (const file of doc.files) {
                const filePath = path.join(uploadDir, path.basename(file.path));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Đã xóa file: ${filePath}`);
                }
            }
        }
        // Sau đó xóa document trong database
        const result = await Document.deleteMany({isTrash: true, day: {$lt: expiredTime}});
        console.log(`Đã xóa ${result.deletedCount} tài liệu trong thời gian ${expiredTime}`);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const cronJobCleanDocument = () => {
    cron.schedule(`*/${process.env.CRON_JOB_DOCUMENT_EXPIRED_TIME} * * * * *`, cleanDocumentJob);
}