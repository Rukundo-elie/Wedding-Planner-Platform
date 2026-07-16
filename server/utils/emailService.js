const { Resend } = require('resend');

const sendInquiryEmail = async (contactData) => {
  const { name, email, subject, message } = contactData;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const receiverEmail = process.env.PLANNER_RECEIVER_EMAIL;

  // Defensive check: Skip sending if Resend API key is not specified
  if (!resendApiKey) {
    console.warn('[Email Warning]: RESEND_API_KEY is not configured in your .env. The message was saved to the database, but notification email sending was skipped.');
    return false;
  }

  if (!receiverEmail) {
    console.warn('[Email Warning]: PLANNER_RECEIVER_EMAIL is not configured in your .env. Notification email sending skipped.');
    return false;
  }

  try {
    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: `Wedding Planner Platform <${fromEmail}>`,
      to: receiverEmail,
      replyTo: email, // Clicking "Reply" in your email client will email the sender directly
      subject: `💍 Wedding Inquiry: ${subject} (from ${name})`,
      text: `Hello Planner,

You have received a new contact inquiry from the Wedding Planner & Budget Management Platform:

--------------------------------------------------
Sender Name: ${name}
Sender Email: ${email}
Subject Line: ${subject}
Received At: ${new Date().toLocaleString()}
--------------------------------------------------

Message:
${message}

--------------------------------------------------
To respond to this customer, simply click "Reply" to this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; border: 1px solid #f3e8ff; border-radius: 12px; padding: 24px; color: #1f2937;">
          <h2 style="color: #db2777; margin-bottom: 20px; font-weight: bold; border-bottom: 2px solid #fce7f3; padding-bottom: 10px;">💍 New Wedding Inquiry</h2>
          
          <p>Hello Planner,</p>
          <p>You have received a new contact inquiry from the Wedding Planner & Budget Management Platform:</p>
          
          <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Sender Name:</strong> ${name}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #db2777; text-decoration: none;">${email}</a></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Subject Line:</strong> ${subject}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Received At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p><strong>Message Detail:</strong></p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 18px; border-radius: 8px; font-style: italic; white-space: pre-wrap;">${message}</div>
          
          <div style="margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 13px; color: #6b7280; text-align: center;">
            <p style="margin: 0;">To respond to this customer, simply click <strong>"Reply"</strong> in your email client to email them directly.</p>
          </div>
        </div>
      `
    });

    if (emailResponse.error) {
      console.error('[Email Error]: Resend API returned an error:', emailResponse.error);
      return false;
    }

    console.log('[Email Success]: Inquiry notification email sent successfully via Resend:', emailResponse.data?.id);
    return true;
  } catch (error) {
    console.error('[Email Error]: Failed to send notification email via Resend:', error);
    return false;
  }
};

module.exports = {
  sendInquiryEmail
};
