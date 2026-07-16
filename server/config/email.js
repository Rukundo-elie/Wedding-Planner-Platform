// server/config/email.js
const { Resend } = require('resend');

const sendContactEmail = async (contactData) => {
  const { name, email, phone, subject, message } = contactData;

  const resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.split('#')[0].trim() : '';
  if (!resendApiKey) {
    console.warn('[Email Warning]: RESEND_API_KEY is not configured in your .env. Email notification was skipped.');
    return { success: false, error: 'Missing API Key' };
  }

  const resend = new Resend(resendApiKey);

  // Get admin/planner recipients from environment variables
  const adminEmails = process.env.CONTACT_RECIPIENTS
    ? process.env.CONTACT_RECIPIENTS.split(',').map(e => e.trim())
    : ['admin@weddingplanner.com'];

  // Sender email (must be verified in Resend, or use their test domain)
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const results = [];

  try {
    // 1. Send notification email to Admins/Planners
    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      replyTo: email,
      subject: `📩 New Contact Message: ${subject || 'No Subject'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4a6fa5;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="font-weight: bold; padding: 5px 0;">Name:</td><td>${name}</td></tr>
            <tr><td style="font-weight: bold; padding: 5px 0;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="font-weight: bold; padding: 5px 0;">Phone:</td><td>${phone}</td></tr>` : ''}
            ${subject ? `<tr><td style="font-weight: bold; padding: 5px 0;">Subject:</td><td>${subject}</td></tr>` : ''}
          </table>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0;">Message:</h4>
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 10px;">
            This message was sent from your Wedding Planner Platform.
          </p>
        </div>
      `,
    });
    results.push({ recipient: 'Admins/Planners', success: true, id: adminResult.id });

    // 2. Send auto-reply to the user (optional, enabled by default)
    if (process.env.SEND_AUTO_REPLY !== 'false') {
      const userResult = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Thank you for contacting Wedding Planner Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4a6fa5;">Thank You for Reaching Out!</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We have received your message and our team will get back to you as soon as possible.</p>
            <div style="background: #f9f9f9; padding: 10px; border-left: 4px solid #4a6fa5; margin: 15px 0;">
              <strong>Your Message:</strong><br>
              ${message}
            </div>
            <p>If this is urgent, please call us at <strong>+250 788 123 456</strong>.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated response. Please do not reply to this email.</p>
          </div>
        `,
      });
      results.push({ recipient: email, success: true, id: userResult.id });
    }

    return { success: true, results };
  } catch (error) {
    console.error('Resend email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendContactEmail };