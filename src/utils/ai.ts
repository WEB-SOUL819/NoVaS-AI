
import { AIResponse, Message, AutomationTask } from "@/types";
import { processWithAI } from "./aiService";
import { analyzeForAutomation, generateAutomationWorkflow } from "./automationUtils";
import { extractKeywords } from "./conversationUtils";

// Export the main functions from this file to maintain backwards compatibility
export { processWithAI, analyzeForAutomation, generateAutomationWorkflow, extractKeywords };
