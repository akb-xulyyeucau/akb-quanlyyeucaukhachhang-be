import { Router } from "express";
import { sendMailController , sendMailTemplateController} from "../controllers/mail.controller";

const router = Router();

router.post("/send-mail", sendMailController);
router.post("/send-mail-template" , sendMailTemplateController);

export default router;