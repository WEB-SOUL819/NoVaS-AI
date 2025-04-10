
import { SYSTEM_PROMPTS } from "@/config/env";
import { Message, AutomationTask } from "@/types";
import { processWithAI } from "./aiService";

/**
 * Analyze text and extract potential automation tasks
 */
export async function analyzeForAutomation(text: string): Promise<AutomationTask[]> {
  try {
    const systemPrompt = SYSTEM_PROMPTS.AUTOMATION;
    const messages: Message[] = [
      {
        id: "automation-analysis",
        role: "user",
        content: `Analyze this text and identify any potential automation tasks: ${text}`,
        timestamp: new Date()
      }
    ];

    const response = await processWithAI(messages, systemPrompt);
    
    // Parse the response to extract automation tasks
    // The AI is prompted to return tasks in a specific format
    const taskRegex = /Task: (.+)\nType: (.+)\nDetails: (.+)(?:\n|$)/g;
    const tasks: AutomationTask[] = [];
    let match;
    
    while ((match = taskRegex.exec(response.text)) !== null) {
      tasks.push({
        id: crypto.randomUUID(),
        name: match[1].trim(),
        type: match[2].trim() as "reminder" | "schedule" | "trigger" | "workflow",
        details: match[3].trim(),
        status: "pending",
        createdAt: new Date()
      });
    }
    
    return tasks;
  } catch (error) {
    console.error("Error analyzing for automation:", error);
    return [];
  }
}

/**
 * Generate an automation workflow based on user request
 */
export async function generateAutomationWorkflow(request: string): Promise<string> {
  try {
    const systemPrompt = SYSTEM_PROMPTS.AUTOMATION_WORKFLOW;
    const messages: Message[] = [
      {
        id: "automation-workflow",
        role: "user",
        content: `Create an automation workflow for this request: ${request}`,
        timestamp: new Date()
      }
    ];

    const response = await processWithAI(messages, systemPrompt);
    return response.text;
  } catch (error) {
    console.error("Error generating automation workflow:", error);
    return "I'm sorry, I encountered an error while generating the automation workflow.";
  }
}
