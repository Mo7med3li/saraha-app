import nodemailer from "nodemailer";

export const sendEmail = async ({
  from = process.env.APP_EMAIL,
  to = "",
  subject = "Saraha App 🔥",
  text = "",
  html = "",
  cc = [],
  bcc = [],
  attachments = [],
}) => {
  // nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Saraha App " <${from}>`, // sender address
    to, // list of recipients
    subject, // subject line
    cc,
    bcc,
    text, // plain text body
    html, // html body
    attachments,
  });
};
