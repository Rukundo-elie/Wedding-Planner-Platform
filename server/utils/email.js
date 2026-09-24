const nodemailer = require('nodemailer');
const { Resend } = require('resend');

/**
 * Sends a password reset email to the specified user email address.
 * 
 * @param {Object} options
 * @param {string} options.to - User email address
 * @param {string} options.name - User full name
 * @param {string} options.resetUrl - The full password reset URL
 */
const sendPasswordResetEmail = async ({ to, name = 'Valued User', resetUrl }) => {
  const subject = '🔐 Reset Your Password - Wedding Planner Platform';
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #e11d48; margin: 0; font-size: 24px;">Wedding Planner Platform</h2>
        <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
      </div>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
      
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
        We received a request to reset the password for your account. Click the button below to choose a new password:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" target="_blank" style="background-color: #e11d48; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);">
          Reset Password Now
        </a>
      </div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        Or copy and paste this link into your web browser:<br />
        <a href="${resetUrl}" style="color: #e11d48; word-break: break-all;">${resetUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If you did not request a password reset, you can safely ignore this email. This link will expire in 1 hour.
      </p>
    </div>
  `;

  // 1. Try Resend API if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_api_key')) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      await resend.emails.send({
        from: `Wedding Planner <${fromEmail}>`,
        to: [to],
        subject,
        html: htmlContent,
      });
      console.log(`[Email Success]: Password reset email sent via Resend to ${to}`);
      return { success: true, provider: 'Resend' };
    } catch (err) {
      console.error('[Resend Error]:', err.message);
    }
  }

  // 2. Try Nodemailer SMTP (Gmail / Custom SMTP) if SMTP_USER is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const isGmail = (process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail');
      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            }
          : {
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port: Number(process.env.SMTP_PORT) || 587,
              secure: Number(process.env.SMTP_PORT) === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            }
      );

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Wedding Planner Platform" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Success]: Password reset email sent via Gmail SMTP to ${to}`);
      return { success: true, provider: 'Gmail SMTP' };
    } catch (err) {
      console.error('[Gmail SMTP Error]:', err.message);
    }
  }

  // 3. Fallback: Log reset link to console if no email provider is configured
  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET LINK FOR ${to}]:`);
  console.log(`${resetUrl}`);
  console.log(`======================================================\n`);
  return { success: false, provider: 'None' };
};

module.exports = {
  sendPasswordResetEmail,
};
