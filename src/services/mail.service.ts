import transporter from "../configs/mail.config";
import fs from 'fs';
import handlebars from 'handlebars';
interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendMail = async (options: SendMailOptions) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
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
  data: any
) => {
  const filePath = `src/mails/templates/${templateName}.hbs`;
  const source = fs.readFileSync(filePath, "utf8");
  const compiledTemplate = handlebars.compile(source);
  const html = compiledTemplate(data);

  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};