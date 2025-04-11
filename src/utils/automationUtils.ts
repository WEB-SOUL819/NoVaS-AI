
import { SYSTEM_PROMPTS } from "@/config/env";
import { Message, AutomationTask, AutomationWorkflow } from "@/types";
import { processWithAI } from "./aiService";
import { supabase } from "@/integrations/supabase/client";
import { AUTOMATION_KNOWLEDGE_BASES } from "./ai";
import { toast } from "sonner";

// Define a type for the Chrome API to make TypeScript happy
interface ChromeAlarmAPI {
  alarms?: {
    create: (name: string, options: { when: number }) => void;
    onAlarm: {
      addListener: (callback: (alarm: { name: string }) => void) => void;
    };
  };
}

// Define window interface extension for our custom property
declare global {
  interface Window {
    alarmListenerSet?: boolean;
    chrome?: ChromeAlarmAPI;
  }
}

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
    const systemPrompt = SYSTEM_PROMPTS.AUTOMATION + generateKnowledgeBasePrompt();
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
 * Generate a prompt with knowledge base information
 */
function generateKnowledgeBasePrompt(): string {
  let knowledgePrompt = "\n\nYou have access to the following knowledge bases for automation:\n";
  
  AUTOMATION_KNOWLEDGE_BASES.forEach(kb => {
    knowledgePrompt += `- ${kb.name}: ${kb.description}\n`;
  });
  
  knowledgePrompt += "\nLeverage these knowledge bases to provide accurate and helpful automation suggestions.";
  
  return knowledgePrompt;
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
    
    // Create the task
    const reminderTask: AutomationTask = {
      id: crypto.randomUUID(),
      name: `Reminder: ${taskDescription}`,
      type: "reminder",
      details: `${taskDescription} at ${timeString} on ${dateString}`,
      status: "pending",
      createdAt: new Date(),
      schedule: `${dateString} ${timeString}`
    };
    
    tasks.push(reminderTask);
    
    // Actually set the device alarm or reminder if possible
    setDeviceAlarm(taskDescription, timeMatch, dateMatch);
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
 * Actually set an alarm or reminder on the device if possible
 */
function setDeviceAlarm(description: string, timeMatch: RegExpMatchArray | null, dateMatch: RegExpMatchArray | null): void {
  try {
    // Check if notification API is available
    if ('Notification' in window) {
      // Request permission if not already granted
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            scheduleNotification(description, timeMatch, dateMatch);
          }
        });
      } else {
        scheduleNotification(description, timeMatch, dateMatch);
      }
    }
    
    // Also try to use the alarm API if available (Chrome extensions, PWAs)
    if (window.chrome && window.chrome.alarms) {
      scheduleChromiumAlarm(description, timeMatch, dateMatch);
    }
    
    toast.success("Alarm has been set on your device");
  } catch (error) {
    console.error("Error setting device alarm:", error);
    toast.error("Could not set alarm on your device. Permission may be required.");
  }
}

/**
 * Schedule a notification at the specified time
 */
function scheduleNotification(description: string, timeMatch: RegExpMatchArray | null, dateMatch: RegExpMatchArray | null): void {
  // Calculate when to show the notification
  const targetTime = calculateTargetTime(timeMatch, dateMatch);
  
  // Calculate delay in milliseconds
  const now = new Date();
  const delay = targetTime.getTime() - now.getTime();
  
  if (delay > 0) {
    // Schedule the notification
    setTimeout(() => {
      new Notification("Reminder", {
        body: description,
        icon: "/favicon.ico"
      });
      
      // Also play a sound
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(e => console.error("Error playing notification sound:", e));
    }, delay);
    
    console.log(`Notification scheduled for ${targetTime.toLocaleString()}, in ${delay}ms`);
  } else {
    // If time is in the past, show notification immediately
    new Notification("Reminder", {
      body: description,
      icon: "/favicon.ico"
    });
  }
}

/**
 * Schedule an alarm using Chromium's alarm API (for extensions/PWAs)
 */
function scheduleChromiumAlarm(description: string, timeMatch: RegExpMatchArray | null, dateMatch: RegExpMatchArray | null): void {
  // Only available in Chromium extensions
  if (typeof window !== 'undefined' && window.chrome && window.chrome.alarms) {
    const targetTime = calculateTargetTime(timeMatch, dateMatch);
    
    // Create an alarm with Chromium's API
    window.chrome.alarms.create(description, {
      when: targetTime.getTime()
    });
    
    console.log(`Chrome alarm scheduled for ${targetTime.toLocaleString()}`);
    
    // Set up the alarm listener if not already set
    if (!window.alarmListenerSet) {
      window.chrome.alarms.onAlarm.addListener((alarm) => {
        new Notification("Reminder", {
          body: alarm.name,
          icon: "/favicon.ico"
        });
      });
      
      window.alarmListenerSet = true;
    }
  }
}

/**
 * Calculate the target time for an alarm or reminder
 */
function calculateTargetTime(timeMatch: RegExpMatchArray | null, dateMatch: RegExpMatchArray | null): Date {
  const now = new Date();
  const result = new Date(now);
  
  // Set time if specified
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3]?.toLowerCase();
    
    // Convert hour to 24-hour format if needed
    let hour24 = hour;
    if (period === 'pm' && hour < 12) {
      hour24 = hour + 12;
    } else if (period === 'am' && hour === 12) {
      hour24 = 0;
    }
    
    result.setHours(hour24, minute, 0, 0);
  }
  
  // Set date if specified
  if (dateMatch) {
    const dateStr = dateMatch[1].toLowerCase();
    
    if (dateStr === 'tomorrow') {
      result.setDate(result.getDate() + 1);
    } else if (dateStr !== 'today') {
      // Handle days of week
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = daysOfWeek.indexOf(dateStr);
      
      if (dayIndex !== -1) {
        const currentDay = result.getDay();
        let daysToAdd = dayIndex - currentDay;
        
        // If the day has already passed this week, schedule for next week
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        }
        
        result.setDate(result.getDate() + daysToAdd);
      }
    }
  }
  
  // If resulting time is in the past, schedule for the next day
  if (result.getTime() <= now.getTime()) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
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
    
    // Add knowledge base information to prompt
    const systemPrompt = SYSTEM_PROMPTS.AUTOMATION_WORKFLOW + generateKnowledgeBasePrompt();
    
    // If not, use AI
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
