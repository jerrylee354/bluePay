
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

export const ReceiptDetailsSchema = z.object({
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

const ReceiptEmailSchema = z.object({
  subject: z.string(),
  htmlBody: z.string(),
});

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

const generateReceiptPrompt = ai.definePrompt({
    name: 'generateReceiptPrompt',
    input: { schema: ReceiptDetailsSchema },
    output: { schema: ReceiptEmailSchema },
    prompt: `
You are an email generation assistant for a payment app called BluePay. Your task is to generate a friendly and professional HTML email receipt for a transaction.

Generate the subject line and the HTML body for the email based on the provided transaction details.

Here is the transaction information:
- Recipient Name: {{toName}}
- Transaction Type: {{transactionType}}
- Amount: {{amount}} {{currency}}
- Date: {{transactionDate}}
- Transaction ID: {{transactionId}}
{{#if recipientName}}- Other Party: {{recipientName}}{{/if}}
{{#if requesterName}}- From: {{requesterName}}{{/if}}
{{#if note}}- Note: "{{note}}"{{/if}}

The HTML should be modern, clean, and responsive, using inline CSS for compatibility.
- The main subject should be clear (e.g., "Your BluePay Receipt for {{amount}} {{currency}}").
- The body should greet the user by name (e.g., "Hi {{toName}},").
- Clearly state the transaction type, amount, and who the other party was.
- Include the date and transaction ID.
- If there is a note, display it.
- End with a thank you message from "The BluePay Team".
`,
});

export const sendReceiptFlow = ai.defineFlow(
  {
    name: 'sendReceiptFlow',
    inputSchema: ReceiptDetailsSchema,
    outputSchema: z.void(),
  },
  async (details) => {
    const { output } = await generateReceiptPrompt(details);
    if (!output) {
      throw new Error('Failed to generate email content.');
    }
    
    await sendEmail({
      to: details.toEmail,
      subject: output.subject,
      html: output.htmlBody,
    });
  }
);


export async function sendReceipt(details: ReceiptDetails): Promise<void> {
    // This is a wrapper function to call the flow.
    // In a real app, you might add more logic here before or after the flow runs.
    try {
        await sendReceiptFlow(details);
        console.log(`Receipt email sent to ${details.toEmail}`);
    } catch (error) {
        console.error(`Error in sendReceiptFlow for ${details.toEmail}:`, error);
        // We don't re-throw the error to avoid breaking the frontend transaction flow
        // if only the email fails. Logging is important here.
    }
}
