import { sendEmail } from "../emails/send.email.js";
import { confirmEmailTemplate } from "../emails/templates/email.templates.js";

type OtpEmailData = {
  to: string;
  otp: string;
  userName?: string;
  subject?: string;
  title?: string;
};

export const sendConfirmEmail = async (data: OtpEmailData) => {
  return sendEmail({
    to: data.to,
    subject: data.subject || "Confirmation Email",
    html: confirmEmailTemplate({
      otp: data.otp,
      ...(data.userName ? { userName: data.userName } : {}),
      title: data.title || "Confirm your email",
      purpose: "verify your email",
    }),
  });
};

export const sendForgotPasswordEmail = async (data: OtpEmailData) => {
  return sendEmail({
    to: data.to,
    subject: data.subject || "Forgot Password",
    html: confirmEmailTemplate({
      otp: data.otp,
      ...(data.userName ? { userName: data.userName } : {}),
      title: data.title || "Reset your password",
      purpose: "reset your password",
    }),
  });
};
