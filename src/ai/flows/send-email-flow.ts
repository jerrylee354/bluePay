'use server';
/**
 * @fileOverview A Genkit flow that provides a tool for sending emails.
 * This allows an AI model to decide when to send an email based on the context of a conversation.
 * 
 * - notifyUserByEmailTool - A Genkit tool to send an email.
 * - EmailSenderInput - The input type for the email sending tool.
 * - EmailSenderOutput - The return type for the email sending tool.
 */

import { ai } from '@/ai/genkit';
import { sendEmail, SendEmailSchema } from '@/services/email-service';
import { z } from 'zod';

// Expose the input schema for external use if needed.
export const EmailSenderInputSchema = SendEmailSchema;
export type EmailSenderInput = z.infer<typeof EmailSenderInputSchema>;

// Define the output schema for the tool.
export const EmailSenderOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
});
export type EmailSenderOutput = z.infer<typeof EmailSenderOutputSchema>;


/**
 * Defines a Genkit tool that allows an AI model to send an email.
 * The tool's description is crucial for the model to understand when and how to use it.
 */
export const notifyUserByEmailTool = ai.defineTool(
  {
    name: 'notifyUserByEmail',
    description: 'Send an email to a user. Use this to confirm actions, send summaries, or provide requested information directly to their inbox.',
    inputSchema: EmailSenderInputSchema,
    outputSchema: EmailSenderOutputSchema,
  },
  async (input) => {
    console.log(`Email tool called with input: ${JSON.stringify(input)}`);
    const success = await sendEmail(input);
    return { success };
  }
);


/**
 * Example of a flow that utilizes the email sending tool.
 * 
 * The AI is given the tool and a system prompt that encourages its use.
 * Based on the user's request, the model can choose to call the `notifyUserByEmail` tool.
 */
const agenticEmailerFlow = ai.defineFlow(
  {
    name: 'agenticEmailerFlow',
    inputSchema: z.object({
      userRequest: z.string(),
      userEmail: z.string().email(),
    }),
    outputSchema: z.string().describe("The agent's final response to the user."),
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      tools: [notifyUserByEmailTool],
      prompt: `The user's email is ${input.userEmail}. Address their request: ${input.userRequest}`,
      system: `You are a helpful assistant for BluePay. 
               When a user asks for a summary or confirmation, offer to send it to them via email and use the notifyUserByEmail tool to do so.
               Always confirm with the user before sending an email.
               After using the tool, report the result (success or failure) to the user.`,
    });
    
    return output?.text ?? "I'm sorry, I couldn't process that request.";
  }
);

// Export a wrapper function for client-side usage.
export async function agenticEmailer(input: z.infer<typeof agenticEmailerFlow.inputSchema>): Promise<string> {
    return await agenticEmailerFlow(input);
}
