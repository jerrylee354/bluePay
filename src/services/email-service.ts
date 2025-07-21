'use server';
/**
 * @fileOverview Email sending service using Nodemailer.
 * This service is responsible for configuring and sending emails via an SMTP transporter.
 * It is designed to be called from server-side logic, such as Genkit flows.
 */

import nodemailer from 'nodemailer';
import { z } from 'zod';

// Define the schema for the email sending function input.
export const SendEmailSchema = z.object({
  to: z.string().email().describe('The recipient\'s email address.'),
  subject: z.string().describe('The subject line of the email.'),
  html: z.string().describe('The HTML content of the email body.'),
  text: z.string().optional().describe('The plain text content of the email body (optional).'),
});
export type SendEmailInput = z.infer<typeof SendEmailSchema>;

/**
 * Creates an SMTP transporter using Nodemailer.
 * In a real application, these credentials should come from environment variables
 * and not be hardcoded.
 * 
 * @example
 * const transporter = nodemailer.createTransport({
 *   host: process.env.SMTP_HOST,
 *   port: parseInt(process.env.SMTP_PORT || "587", 10),
 *   secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASS,
 *   },
 * });
 */
const transporter = nodemailer.createTransport({
  // IMPORTANT: Replace with your actual SMTP service provider details.
  // Using a service like SendGrid, Mailgun, or Resend is highly recommended for deliverability.
  host: 'smtp.example.com', // e.g., 'smtp.resend.com' or 'smtp.sendgrid.net'
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-smtp-username', // e.g., 'apikey' for SendGrid/Resend
    pass: 'your-smtp-password', // Your API key or password
  },
});

/**
 * Sends an email using the configured Nodemailer transporter.
 * @param {SendEmailInput} input - The email details (to, subject, html, text).
 * @returns {Promise<boolean>} A promise that resolves to true if the email is sent successfully, otherwise false.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const { to, subject, html, text } = input;

  // Verify the transporter configuration. In development, this helps catch issues early.
  // In production, you might want to do this less frequently.
  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP transporter verification failed:', error);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: '"BluePay" <noreply@yourdomain.com>', // Replace with your verified sender email
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Basic HTML to text conversion if text is not provided
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
