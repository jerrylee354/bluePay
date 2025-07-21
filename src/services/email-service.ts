
'use server';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

// Ensure these environment variables are set in your .env file
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
  console.warn(
    'SMTP environment variables are not fully configured. Email sending will be disabled.'
  );
}

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!transporter) {
    console.error('Email service is not configured. Skipping email send.');
    // In a real app, you might want to throw an error or handle this differently.
    // For this context, we will silently fail to avoid breaking the app if email is not set up.
    return;
  }

  const mailOptions = {
    from: `"BluePay" <${SMTP_FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', options.to);
  } catch (error) {
    console.error('Error sending email:', error);
    // We do not re-throw here to prevent a failed email from breaking the entire transaction flow.
    // In a production environment, you would want to log this to a monitoring service.
  }
};
