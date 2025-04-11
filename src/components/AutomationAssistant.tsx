
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Message } from "@/types";
import { toast } from "sonner";
import { Brain, Send, ChevronRight, Sparkles, BrainCircuit, Clock, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutomation } from "@/hooks/useAutomation";
import { AutomationTask } from "@/types";

const AutomationAssistant = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your Automation Assistant. I can help you create and manage automations. What would you like to automate today?",
      timestamp: new Date()
    }
  ]);
  
  const { saveTask } = useAutomation();
  
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      const placeholderMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "...",
        timestamp: new Date(),
        isProcessing: true
      };
      
      setMessages(prev => [...prev, placeholderMessage]);
      
      // Check for common automation patterns
      const response = await processLocalAutomation(input);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === placeholderMessage.id
            ? {
                ...msg,
                content: response,
                isProcessing: false
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error processing automation:", error);
      toast.error("Failed to process your request. Please try again.");
      
      setMessages(prev => prev.filter(msg => !msg.isProcessing));
    } finally {
      setIsProcessing(false);
    }
  };

  // Process common automation patterns locally without relying on external API
  const processLocalAutomation = async (input: string): Promise<string> => {
    const normalizedInput = input.toLowerCase();
    
    // Handle alarm/reminder creation
    if (normalizedInput.includes("alarm") || normalizedInput.includes("reminder") || 
        normalizedInput.includes("remind me") || normalizedInput.includes("set a timer")) {
      return handleAlarmOrReminder(input);
    }
    
    // Handle scheduled tasks
    if (normalizedInput.includes("schedule") || normalizedInput.includes("every day") ||
        normalizedInput.includes("weekly") || normalizedInput.includes("monthly")) {
      return handleScheduleTask(input);
    }
    
    // Handle email automation
    if (normalizedInput.includes("email") || normalizedInput.includes("message") || 
        normalizedInput.includes("notification")) {
      return handleCommunication(input);
    }
    
    // Handle data processing
    if (normalizedInput.includes("organize") || normalizedInput.includes("collect") || 
        normalizedInput.includes("gather data") || normalizedInput.includes("process")) {
      return handleDataProcessing(input);
    }
    
    // Default response for other types of automation
    return "I understand you want to set up an automation. Please tell me more specifically what you'd like to automate, such as 'remind me to check emails at 9am' or 'schedule a daily report'";
  }
  
  const handleAlarmOrReminder = async (input: string): Promise<string> => {
    try {
      // Extract time using regex patterns
      const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/;
      const datePattern = /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
      
      const timeMatch = input.match(timePattern);
      const dateMatch = input.match(datePattern);
      
      // Extract task description
      const actionKeywords = ["remind me to", "set an alarm for", "remind me about", "create a reminder for"];
      let taskDescription = input;
      
      for (const keyword of actionKeywords) {
        if (input.includes(keyword)) {
          taskDescription = input.split(keyword)[1].trim();
          break;
        }
      }
      
      // Format time for display
      let timeString = "soon";
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3]?.toLowerCase() || (hour < 12 ? "am" : "pm");
        
        timeString = `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
      }
      
      // Format date for display
      let dateString = "today";
      if (dateMatch) {
        dateString = dateMatch[1].toLowerCase();
      }
      
      // Create the automation task
      const newTask: AutomationTask = {
        id: crypto.randomUUID(),
        name: `Reminder: ${taskDescription}`,
        type: "reminder",
        details: `${taskDescription} at ${timeString} on ${dateString}`,
        status: "pending",
        createdAt: new Date(),
        schedule: `${dateString} ${timeString}`
      };
      
      await saveTask(newTask);
      
      return `I've created a reminder for "${taskDescription}" at ${timeString} on ${dateString}. You can view and manage this in your Automation Tasks list.`;
    } catch (error) {
      console.error("Error creating alarm/reminder:", error);
      return "I had trouble creating that reminder. Please try again with a specific time format like 'remind me to check emails at 9:00 am tomorrow'.";
    }
  }
  
  const handleScheduleTask = async (input: string): Promise<string> => {
    try {
      // Extract frequency patterns
      const dailyPattern = /(every day|daily)/i;
      const weeklyPattern = /(every week|weekly|every \w+day)/i;
      const monthlyPattern = /(every month|monthly)/i;
      
      let frequency = "once";
      if (dailyPattern.test(input)) frequency = "daily";
      if (weeklyPattern.test(input)) frequency = "weekly";
      if (monthlyPattern.test(input)) frequency = "monthly";
      
      // Extract task description
      const actionKeywords = ["schedule", "setup", "create", "make"];
      let taskDescription = input;
      
      for (const keyword of actionKeywords) {
        if (input.includes(keyword)) {
          const parts = input.split(keyword);
          if (parts.length > 1) {
            taskDescription = parts[1].trim();
            break;
          }
        }
      }
      
      // Create the automation task
      const newTask: AutomationTask = {
        id: crypto.randomUUID(),
        name: `Scheduled Task: ${taskDescription.substring(0, 30)}${taskDescription.length > 30 ? '...' : ''}`,
        type: "schedule",
        details: `${taskDescription} (${frequency})`,
        status: "pending",
        createdAt: new Date(),
        schedule: frequency
      };
      
      await saveTask(newTask);
      
      return `I've created a ${frequency} scheduled task for "${taskDescription}". You can view and manage this in your Automation Tasks list.`;
    } catch (error) {
      console.error("Error creating scheduled task:", error);
      return "I had trouble creating that scheduled task. Please try again with a clear frequency like 'setup a daily report email'.";
    }
  }
  
  const handleCommunication = async (input: string): Promise<string> => {
    try {
      const newTask: AutomationTask = {
        id: crypto.randomUUID(),
        name: `Communication: ${input.substring(0, 30)}${input.length > 30 ? '...' : ''}`,
        type: "workflow",
        details: input,
        status: "pending",
        createdAt: new Date()
      };
      
      await saveTask(newTask);
      
      return `I've created a communication automation for "${input}". You can view and manage this in your Automation Tasks list.`;
    } catch (error) {
      console.error("Error creating communication task:", error);
      return "I had trouble creating that communication automation. Please try a simpler request.";
    }
  }
  
  const handleDataProcessing = async (input: string): Promise<string> => {
    try {
      const newTask: AutomationTask = {
        id: crypto.randomUUID(),
        name: `Data Processing: ${input.substring(0, 30)}${input.length > 30 ? '...' : ''}`,
        type: "workflow",
        details: input,
        status: "pending",
        createdAt: new Date()
      };
      
      await saveTask(newTask);
      
      return `I've created a data processing automation for "${input}". You can view and manage this in your Automation Tasks list.`;
    } catch (error) {
      console.error("Error creating data processing task:", error);
      return "I had trouble creating that data processing automation. Please try a simpler request.";
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2 text-purple-400" />
          Automation Assistant
        </CardTitle>
        <CardDescription>
          Ask questions or get help with creating automations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 border border-gray-700"
                    }`}
                  >
                    {message.role === "assistant" && !message.isProcessing && (
                      <div className="flex items-center mb-1">
                        <Brain className="h-3 w-3 mr-1 text-purple-400" />
                        <Badge variant="outline" className="text-xs">
                          Automation Assistant
                        </Badge>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap">
                      {message.isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    {message.role === "assistant" && !message.isProcessing && (
                      <div className="text-right mt-1 text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <Separator className="my-2" />
          
          <div className="mt-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about automations or how to set them up..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Quick Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Set an alarm for 9:00am", 
                  "Remind me to check emails at 2pm", 
                  "Schedule a daily report",
                  "Create a weekly backup reminder"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="text-xs bg-gray-800 hover:bg-gray-700 transition-colors py-1 px-2 rounded-full flex items-center"
                    onClick={() => {
                      setInput(suggestion);
                    }}
                  >
                    {suggestion.includes("alarm") || suggestion.includes("Remind") ? (
                      <Bell className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationAssistant;
