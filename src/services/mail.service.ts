import { createTransporter } from "../configs/mail.config";
import fs from 'fs';
import handlebars from 'handlebars';
import { Request } from "express";
import MailConfig from "../models/mail.model";
import { IMailConfig } from "../interfaces/mail.interface";

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  userId: string;
}

export const sendMail = async (options: SendMailOptions) => {
  const mailConfig = await MailConfig.findOne({ createdBy: options.userId });
  if (!mailConfig) {
    throw new Error("Không tìm thấy cấu hình mail!");
  }

  const transporter = createTransporter(mailConfig);
  const mailOptions = {
    from: `${mailConfig.senderName} <${mailConfig.user}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  return transporter.sendMail(mailOptions);
};

export const sendMailWithTemplate = async (
  to: string,
  subject: string,
  templateName: string,
  data: any,
  userId: string
) => {
  const mailConfig = await MailConfig.findOne({ createdBy: userId });
  if (!mailConfig) {
    throw new Error("Không tìm thấy cấu hình mail!");
  }

  const transporter = createTransporter(mailConfig);
  const filePath = `src/mails/templates/${templateName}.hbs`;
  const source = fs.readFileSync(filePath, "utf8");
  const compiledTemplate = handlebars.compile(source);
  const html = compiledTemplate(data);

  return transporter.sendMail({
    from: `${mailConfig.senderName} <${mailConfig.user}>`,
    to,
    subject,
    html,
  });
};

export const createMailConfig = async ( mailConfig : IMailConfig) => {
  try {
    const newMailConfig = await MailConfig.create(mailConfig);
    return newMailConfig;
  } catch (error) {
    throw new Error("Cấu hình thất bại !");
  }
}

export const getMailConfig = async (req : Request) => {
  try {
    const userId = req.user?._id;
    const mailConfig = await MailConfig.findOne({createdBy : userId});
    if(!mailConfig) {
      throw new Error("Bạn không có quyền truy cập !");
    }
    return mailConfig;
  } catch (error) {
    throw new Error("Lỗi khi lấy cấu hình !");
  }
}

export const updateMailConfig = async (req : Request , mailConfig : IMailConfig) => {
  try {
    const userId = req.user?._id;
    const updatedMailConfig = await MailConfig.findOneAndUpdate({createdBy : userId} , mailConfig , {new : true});
    if(!updatedMailConfig) {
      throw new Error("Bạn không có quyền truy cập !");
    }
    return updatedMailConfig;
  } catch (error) {
    throw new Error("Lỗi khi cập nhật cấu hình !");
  }
}

export const deleteMailConfig = async (req : Request) => {
  try {
    const userId = req.user?._id;
    const deletedMailConfig = await MailConfig.findOneAndDelete({createdBy : userId});
    if(!deletedMailConfig) {
      throw new Error("Bạn không có quyền truy cập !");
    }
    return deletedMailConfig;
  } catch (error) {
    throw new Error("Lỗi khi xóa cấu hình !");
  }
}