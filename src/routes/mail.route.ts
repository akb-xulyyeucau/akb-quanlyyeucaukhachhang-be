import { Router } from "express";
import { sendMailController , sendMailTemplateController, createMailConfigController, getMailConfigController, updateMailConfigController, deleteMailConfigController} from "../controllers/mail.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();
router.use(protect);
router.post("/send-mail", sendMailController);
router.post("/send-mail-template" , sendMailTemplateController);


router.post("/create-mail-config" , createMailConfigController);
router.get("/get-mail-config" , getMailConfigController);
router.put("/update-mail-config" , updateMailConfigController);
router.delete("/delete-mail-config" , deleteMailConfigController);

export default router;