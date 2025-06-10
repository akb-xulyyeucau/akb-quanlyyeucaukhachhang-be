import { cronJobCleanDocument } from "../utils/cleanDocument.job";
import { cronJobCleanProject } from "../utils/cleanProjectPending";

export const cronJob = () => {
    cronJobCleanDocument();
    cronJobCleanProject();
}
