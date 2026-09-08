import { Resend } from "resend";

type SendEmailParams = {
  from?: string;
  to?: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
};

export const sendEmail = async ({
  from = process.env.APP_EMAIL || "onboarding@resend.dev",
  to = "",
  subject = "Saraha App",
  text = "",
  html = "",
  cc,
  bcc,
}: SendEmailParams) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(apiKey);
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const { data, error } = await resend.emails.send({
      from: `Saraha App <${from}>`,
      to: recipients,
      subject,
      ...(html ? { html } : { text: text || " " }),
      ...(cc ? { cc } : {}),
      ...(bcc ? { bcc } : {}),
    });

    if (error) {
      console.error("Resend sendMail error:", error);
      throw new Error(error.message || "Failed to send email");
    }

    console.log(`Email sent to ${recipients.join(", ")}: ${data?.id}`);
    return data;
  } catch (error) {
    console.error("Resend sendMail error:", error);
    throw error;
  }
};
