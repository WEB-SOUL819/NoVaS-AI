
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { processWithAI } from "@/utils/ai";
import { Message } from "@/types";
import { toast } from "sonner";
import { Brain, Send, ChevronRight, Sparkles, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    // Add user message to the conversation
    setMessages([...messages, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      // Create a placeholder for the assistant's response
      const placeholderMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "...",
        timestamp: new Date(),
        isProcessing: true
      };
      
      setMessages(prev => [...prev, placeholderMessage]);
      
      // Process with AI using the AUTOMATION_WORKFLOW prompt
      const response = await processWithAI([...messages, userMessage], "AUTOMATION_WORKFLOW");
      
      // Replace the placeholder with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === placeholderMessage.id
            ? {
                ...msg,
                content: response.text,
                isProcessing: false
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error processing with AI:", error);
      toast.error("Failed to process your request. Please try again.");
      
      // Remove the placeholder message
      setMessages(prev => prev.filter(msg => !msg.isProcessing));
    } finally {
      setIsProcessing(false);
    }
  };
  
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
                {["How do I create a reminder?", "Can you automate email processing?", "Create a daily digest workflow"].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="text-xs bg-gray-800 hover:bg-gray-700 transition-colors py-1 px-2 rounded-full flex items-center"
                    onClick={() => {
                      setInput(suggestion);
                    }}
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
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
