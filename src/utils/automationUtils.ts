
import { SYSTEM_PROMPTS } from "@/config/env";
import { Message, AutomationTask, AutomationWorkflow } from "@/types";
import { processWithAI } from "./aiService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Analyze text and extract potential automation tasks
 */
export async function analyzeForAutomation(text: string): Promise<AutomationTask[]> {
  try {
    // First try to analyze locally for common patterns
    const localTasks = analyzeTextLocally(text);
    if (localTasks.length > 0) {
      return localTasks;
    }
    
    // If no local patterns match, try AI-based analysis
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
 * Analyze text for common automation patterns locally
 */
function analyzeTextLocally(text: string): AutomationTask[] {
  const tasks: AutomationTask[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for reminder patterns
  if (lowerText.includes('remind') || lowerText.includes('alarm') || lowerText.includes('alert')) {
    // Extract time using regex
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/;
    const datePattern = /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
    
    const timeMatch = text.match(timePattern);
    const dateMatch = text.match(datePattern);
    
    // Extract task description
    const actionKeywords = ["remind me to", "set an alarm for", "remind me about", "create a reminder for"];
    let taskDescription = text;
    
    for (const keyword of actionKeywords) {
      if (lowerText.includes(keyword)) {
        taskDescription = text.split(keyword)[1].trim();
        break;
      }
    }
    
    // Format time and date for display
    let timeString = "soon";
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toLowerCase() || (hour < 12 ? "am" : "pm");
      
      timeString = `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
    }
    
    let dateString = "today";
    if (dateMatch) {
      dateString = dateMatch[1].toLowerCase();
    }
    
    tasks.push({
      id: crypto.randomUUID(),
      name: `Reminder: ${taskDescription}`,
      type: "reminder",
      details: `${taskDescription} at ${timeString} on ${dateString}`,
      status: "pending",
      createdAt: new Date(),
      schedule: `${dateString} ${timeString}`
    });
  }
  
  // Check for scheduled task patterns
  if (lowerText.includes('schedule') || lowerText.includes('every day') ||
      lowerText.includes('weekly') || lowerText.includes('monthly')) {
    const dailyPattern = /(every day|daily)/i;
    const weeklyPattern = /(every week|weekly|every \w+day)/i;
    const monthlyPattern = /(every month|monthly)/i;
    
    let frequency = "once";
    if (dailyPattern.test(text)) frequency = "daily";
    if (weeklyPattern.test(text)) frequency = "weekly";
    if (monthlyPattern.test(text)) frequency = "monthly";
    
    // Extract task description
    const actionKeywords = ["schedule", "setup", "create", "make"];
    let taskDescription = text;
    
    for (const keyword of actionKeywords) {
      if (lowerText.includes(keyword)) {
        const parts = text.split(keyword);
        if (parts.length > 1) {
          taskDescription = parts[1].trim();
          break;
        }
      }
    }
    
    tasks.push({
      id: crypto.randomUUID(),
      name: `Scheduled Task: ${taskDescription.substring(0, 30)}${taskDescription.length > 30 ? '...' : ''}`,
      type: "schedule",
      details: `${taskDescription} (${frequency})`,
      status: "pending",
      createdAt: new Date(),
      schedule: frequency
    });
  }
  
  return tasks;
}

/**
 * Generate an automation workflow based on user request
 */
export async function generateAutomationWorkflow(request: string): Promise<string> {
  try {
    // Check if we can generate a workflow locally
    const localWorkflow = generateWorkflowLocally(request);
    if (localWorkflow) {
      return localWorkflow;
    }
    
    // If not, use AI
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

/**
 * Generate a workflow locally for common patterns
 */
function generateWorkflowLocally(request: string): string | null {
  const lowerRequest = request.toLowerCase();
  
  // Email notification workflow
  if (lowerRequest.includes('email') || lowerRequest.includes('notification')) {
    return `# Email Notification Workflow
    
## Trigger
- Specified condition is met

## Actions
1. Prepare email content
2. Send email notification
3. Log notification status

## Implementation Notes
- This workflow can be connected to various triggers like time-based events, data changes, or external events
- Email templates can be customized and personalized
- Notification delivery can be tracked and reported
`;
  }
  
  // Data processing workflow
  if (lowerRequest.includes('data') || lowerRequest.includes('report') || lowerRequest.includes('analyze')) {
    return `# Data Processing Workflow

## Trigger
- New data received
- Scheduled time reached

## Actions
1. Collect data from sources
2. Process and transform data
3. Generate insights/reports
4. Store or distribute results

## Implementation Notes
- Data can be collected from multiple sources
- Processing can include filtering, aggregation, and transformation
- Results can be sent to specified destinations (email, database, etc.)
`;
  }
  
  // No match for common patterns
  return null;
}

/**
 * Save automation task to Supabase
 */
export async function saveTaskToSupabase(userId: string, task: AutomationTask): Promise<boolean> {
  try {
    // Check if user is authenticated
    if (!userId) {
      console.error("Cannot save task: No user ID provided");
      return false;
    }
    
    // Format task for storage
    const taskData = {
      user_id: userId,
      name: task.name,
      type: task.type,
      details: task.details,
      status: task.status,
      created_at: task.createdAt.toISOString(),
      completed_at: task.completedAt ? task.completedAt.toISOString() : null,
      schedule: task.schedule || null,
      trigger_condition: task.triggerCondition || null,
      actions: task.actions ? JSON.stringify(task.actions) : null
    };
    
    // Insert into Supabase automation_tasks table (if it exists)
    const { error } = await supabase
      .from('automation_tasks')
      .insert([taskData])
      .select();
    
    if (error) {
      // If table doesn't exist yet, store in localStorage as fallback
      console.warn("Could not save to Supabase, using localStorage fallback:", error);
      
      // Get existing tasks from localStorage
      const storedTasks = localStorage.getItem(`automation_tasks_${userId}`);
      let tasks = storedTasks ? JSON.parse(storedTasks) : [];
      
      // Add new task
      tasks.push(task);
      
      // Save back to localStorage
      localStorage.setItem(`automation_tasks_${userId}`, JSON.stringify(tasks));
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving task to Supabase:", error);
    return false;
  }
}

/**
 * Save automation workflow to Supabase
 */
export async function saveWorkflowToSupabase(userId: string, workflow: AutomationWorkflow): Promise<boolean> {
  try {
    // Check if user is authenticated
    if (!userId) {
      console.error("Cannot save workflow: No user ID provided");
      return false;
    }
    
    // Format workflow for storage
    const workflowData = {
      user_id: userId,
      name: workflow.name,
      description: workflow.description,
      triggers: JSON.stringify(workflow.triggers),
      actions: JSON.stringify(workflow.actions),
      created_at: workflow.createdAt.toISOString(),
      updated_at: workflow.updatedAt.toISOString(),
      is_active: workflow.isActive
    };
    
    // Insert into Supabase automation_workflows table (if it exists)
    const { error } = await supabase
      .from('automation_workflows')
      .insert([workflowData])
      .select();
    
    if (error) {
      // If table doesn't exist yet, store in localStorage as fallback
      console.warn("Could not save to Supabase, using localStorage fallback:", error);
      
      // Get existing workflows from localStorage
      const storedWorkflows = localStorage.getItem(`automation_workflows_${userId}`);
      let workflows = storedWorkflows ? JSON.parse(storedWorkflows) : [];
      
      // Add new workflow
      workflows.push(workflow);
      
      // Save back to localStorage
      localStorage.setItem(`automation_workflows_${userId}`, JSON.stringify(workflows));
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving workflow to Supabase:", error);
    return false;
  }
}
