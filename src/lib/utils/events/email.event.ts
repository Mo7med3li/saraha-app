import { EventEmitter } from "events";
import { sendEmail } from "../emails/send.email.js";
import { confirmEmailTemplate } from "../emails/templates/email.templates.js";

const emailEvent = new EventEmitter();
emailEvent.on("send-email", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirmation Email",
    html: confirmEmailTemplate({
      otp: data.otp,
      userName: data.userName,
      title: data.title || "Confirm your email",
      purpose: "verify your email",
    }),
  }).catch((error) => {
    console.log(`failed to send email to ${data.to}`);
  });
});

emailEvent.on("send-email-forgot-password", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Forgot Password",
    html: confirmEmailTemplate({
      otp: data.otp,
      userName: data.userName,
      title: data.title || "Reset your password",
      purpose: "reset your password",
    }),
  }).catch((error) => {
    console.log(`failed to send email to ${data.to}`);
  });
});
export default emailEvent;
