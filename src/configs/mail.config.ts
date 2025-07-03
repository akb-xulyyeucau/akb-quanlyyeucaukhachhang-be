import nodemailer from "nodemailer";
import { IMailConfig } from "../interfaces/mail.interface";

export const createTransporter = (mailConfig: IMailConfig) => {
  return nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
  });
};