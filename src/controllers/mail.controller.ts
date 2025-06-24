import { Request, Response } from "express";
import { sendMail , sendMailWithTemplate } from "../services/mail.service";

export const sendMailController = async (req: Request, res: Response) => {
  try {
    const { to, subject, text, html } = req.body;
    await sendMail({ to, subject, text, html });
    res.status(200).json(
    { 
        success: true, 
        message: "Email sent successfully" 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMailTemplateController = async(req : Request , res : Response) =>{
    try {
        const {to , subject , templateName , data} = req.body;
        await sendMailWithTemplate(to, subject , templateName , data);
        res.status(200).json({
            success : true,
            message : "Email sent"
        })
    } catch (error : any) {
        res.status(500).json({ success: false, message: error.message });
    }
}