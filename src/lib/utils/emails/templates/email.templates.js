/**
 * @param {{ otp: string|number, userName?: string }} params
 */
export const confirmEmailTemplate = ({
  otp,
  userName,
  title,
  purpose,
} = {}) => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7f8;font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f7f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,118,130,0.08);">
          <!-- Accent bar -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#0d9488,#14b8a6,#2dd4bf);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Brand -->
          <tr>
            <td align="center" style="padding:36px 40px 8px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;letter-spacing:0.02em;color:#0f766e;">
                Saraha
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:16px 40px 8px;">
              <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;line-height:1.35;color:#134e4a;text-align:center;">
                Confirm your email
              </h1>
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#475569;text-align:center;">
                ${greeting}
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#475569;text-align:center;">
                Use the code below to ${purpose}. It expires soon — enter it only on Saraha.
              </p>
            </td>
          </tr>

          <!-- OTP block -->
          <tr>
            <td align="center" style="padding:28px 40px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;">
                <tr>
                  <td align="center" style="padding:20px 36px;">
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#0d9488;">
                      Verification code
                    </p>
                    <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:0.28em;color:#0f766e;line-height:1.2;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tip -->
          <tr>
            <td style="padding:24px 40px 36px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:#94a3b8;text-align:center;">
                If you didn’t create a Saraha account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">
                © ${year} Saraha · Anonymous messages, safely delivered
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
