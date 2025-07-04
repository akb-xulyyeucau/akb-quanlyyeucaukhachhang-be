import { cronJobCleanDocument } from "../utils/cleanDocument.job";
import { cronJobCleanProject } from "../utils/cleanProjectPending";
import { cronJobProcessMailQueue } from "../utils/mailQueue.job";

export const cronJob = () => {
    cronJobCleanDocument();
    cronJobCleanProject();
    cronJobProcessMailQueue();
    console.log('Tất cả cronjob đã được khởi tạo');
}
