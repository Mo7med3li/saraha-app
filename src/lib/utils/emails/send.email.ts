import nodemailer from "nodemailer";

type SendEmailParams = {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: nodemailer.SendMailOptions["attachments"];
};

export const sendEmail = async ({
  from = process.env.APP_EMAIL,
  to = "",
  subject = "Saraha App",
  text = "",
  html = "",
  cc = [],
  bcc = [],
  attachments = [],
}: SendEmailParams) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Saraha App" <${from}>`,
      to,
      subject,
      cc,
      bcc,
      text,
      html,
      attachments,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Nodemailer sendMail error:", error);
    throw error;
  }
};
