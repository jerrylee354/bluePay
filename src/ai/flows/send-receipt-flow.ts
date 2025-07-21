
'use server';
/**
 * @fileOverview A flow for sending transaction receipts via email.
 *
 * - sendReceipt - A function that handles generating and sending an email receipt.
 * - ReceiptDetails - The input type for the sendReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sendEmail } from '@/services/email-service';

const ReceiptDetailsSchema = z.object({
  toEmail: z.string().email().describe('The recipient\'s email address.'),
  toName: z.string().describe('The recipient\'s name.'),
  transactionId: z.string().describe('The unique ID of the transaction.'),
  transactionDate: z.string().describe('The date and time of the transaction (ISO 8601 format).'),
  transactionType: z.string().describe('The type of transaction (e.g., "Payment Sent", "Payment Received", "Payment Request").'),
  amount: z.number().describe('The transaction amount.'),
  currency: z.string().describe('The currency of the transaction (e.g., "USD").'),
  recipientName: z.string().optional().describe('The name of the other party in the transaction (for payments).'),
  requesterName: z.string().optional().describe('The name of the user requesting payment (for requests).'),
  note: z.string().optional().describe('An optional note included with the transaction.'),
});
export type ReceiptDetails = z.infer<typeof ReceiptDetailsSchema>;

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

function generateReceiptHtml(details: ReceiptDetails): { subject: string, htmlBody: string } {
    const formattedAmount = formatCurrency(details.amount, details.currency);
    const formattedDate = formatDate(details.transactionDate);
    const subject = `Your BluePay Receipt for ${formattedAmount}`;

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 20px; background-color: #f7fafc; color: #1a202c; }
        .container { max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
        .header { background-color: #3880ff; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 24px; }
        .content h2 { font-size: 20px; color: #2d3748; margin-top: 0; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .details-table td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .details-table td:first-child { color: #718096; }
        .details-table td:last-child { text-align: right; font-weight: 500; color: #2d3748; }
        .details-table tr:last-child td { border-bottom: none; }
        .total { font-size: 28px; font-weight: bold; color: #3880ff; margin-top: 24px; text-align: right;}
        .note { background-color: #edf2f7; padding: 16px; border-radius: 6px; margin-top: 24px; font-style: italic; color: #4a5568;}
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #a0aec0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Transaction Receipt</h1>
        </div>
        <div class="content">
            <h2>Hi ${details.toName},</h2>
            <p>Here are the details of your recent transaction:</p>
            <div class="total">${details.transactionType.includes('Sent') ? '-' : '+'} ${formattedAmount}</div>
            <table class="details-table">
                <tr><td>Transaction Type</td><td>${details.transactionType}</td></tr>
                ${details.recipientName ? `<tr><td>To</td><td>${details.recipientName}</td></tr>` : ''}
                ${details.requesterName ? `<tr><td>From</td><td>${details.requesterName}</td></tr>` : ''}
                <tr><td>Date</td><td>${formattedDate}</td></tr>
                <tr><td>Transaction ID</td><td>${details.transactionId}</td></tr>
            </table>
            ${details.note ? `<div class="note"><strong>Note:</strong> ${details.note}</div>` : ''}
        </div>
        <div class="footer">
            <p>Thank you for using BluePay.</p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, htmlBody };
}

const sendReceiptFlow = ai.defineFlow(
  {
    name: 'sendReceiptFlow',
    inputSchema: ReceiptDetailsSchema,
    outputSchema: z.void(),
  },
  async (details) => {
    const { subject, htmlBody } = generateReceiptHtml(details);
    
    await sendEmail({
      to: details.toEmail,
      subject: subject,
      html: htmlBody,
    });
  }
);


export async function sendReceipt(details: ReceiptDetails): Promise<void> {
    try {
        await sendReceiptFlow(details);
        console.log(`Receipt email sent to ${details.toEmail}`);
    } catch (error) {
        console.error(`Error in sendReceiptFlow for ${details.toEmail}:`, error);
        throw error; // Re-throw the error to be caught by the calling function
    }
}
