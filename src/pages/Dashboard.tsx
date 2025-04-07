
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AssistantAvatar from "@/components/AssistantAvatar";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import MessageBubble from "@/components/MessageBubble";
import StatusIndicator from "@/components/StatusIndicator";
import SystemDiagnostics from "@/components/SystemDiagnostics";
import ModuleStatusCard from "@/components/ModuleStatusCard";
import { processWithAI } from "@/utils/ai";
import { textToSpeech, playAudio, startSpeechRecognition } from "@/utils/voice";
import { SYSTEM_CONFIG } from "@/config/env";
import { Message, Module, SystemStatus } from "@/types";
import { Mic, MicOff, Send, VolumeX, Volume2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Demo data for modules
const DEMO_MODULES: Module[] = [
  {
    id: "voice-engine",
    name: "Voice Engine",
    isActive: true,
    status: "operational",
    description: "Speech recognition and TTS functionality.",
  },
  {
    id: "ai-brain",
    name: "AI Brain",
    isActive: true,
    status: "operational",
    description: "Natural language processing and response generation.",
  },
  {
    id: "device-control",
    name: "Device Control",
    isActive: true,
    status: "limited",
    description: "Application and system control capabilities.",
  },
  {
    id: "iot-remote",
    name: "IoT & Remote",
    isActive: false,
    status: "offline",
    description: "Smart device control interface.",
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    isActive: false,
    status: "offline",
    description: "Visual recognition and processing.",
  },
  {
    id: "behavior-engine",
    name: "Behavior Engine",
    isActive: false,
    status: "offline",
    description: "Predictive planning and mood detection.",
  },
];

const Dashboard = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello, I'm ${SYSTEM_CONFIG.ASSISTANT_NAME}. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: true,
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    lastUpdated: new Date(),
    activeModules: DEMO_MODULES.filter(m => m.isActive),
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  
  // Refs
  const messageEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle speech recognition
  useEffect(() => {
    if (micEnabled) {
      setSystemStatus(prev => ({ ...prev, isListening: true }));
      
      speechRecognitionRef.current = startSpeechRecognition(
        (text, isFinal) => {
          setRecognizedText(text);
          
          if (isFinal) {
            handleSubmit(text);
            setRecognizedText("");
          }
        },
        (error) => {
          console.error("Speech recognition error:", error);
          toast.error("Speech recognition error. Please try again.");
          setMicEnabled(false);
          setSystemStatus(prev => ({ ...prev, isListening: false }));
        }
      );
    } else {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      setSystemStatus(prev => ({ ...prev, isListening: false }));
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [micEnabled]);
  
  // Handle form submission
  const handleSubmit = async (text?: string) => {
    const messageText = text || inputMessage;
    if (!messageText.trim()) return;
    
    // Create new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    
    // Create placeholder for assistant response
    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "...",
      timestamp: new Date(),
      isProcessing: true,
    };
    
    // Update messages state
    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setInputMessage("");
    
    // Show thinking state
    setSystemStatus(prev => ({ ...prev, isThinking: true }));
    
    try {
      // Process with AI
      const aiResponse = await processWithAI([...messages, userMessage]);
      
      // Replace placeholder with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholder.id
            ? {
                ...msg,
                content: aiResponse.text,
                isProcessing: false,
              }
            : msg
        )
      );
      
      // Update thinking state
      setSystemStatus(prev => ({ ...prev, isThinking: false }));
      
      // Text-to-speech if enabled
      if (voiceEnabled) {
        setSystemStatus(prev => ({ ...prev, isSpeaking: true }));
        const audioBlob = await textToSpeech(aiResponse.text);
        if (audioBlob) {
          await playAudio(audioBlob);
        }
        setSystemStatus(prev => ({ ...prev, isSpeaking: false }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Update placeholder with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholder.id
            ? {
                ...msg,
                role: "error",
                content: "I'm sorry, I encountered an error processing your request.",
                isProcessing: false,
              }
            : msg
        )
      );
      
      // Reset states
      setSystemStatus(prev => ({ ...prev, isThinking: false, isSpeaking: false }));
      
      // Show error toast
      toast.error("Error processing message. Please try again.");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col w-full overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 glass-panel">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AssistantAvatar size="sm" />
            <h1 className="text-xl font-bold text-white">
              {SYSTEM_CONFIG.ASSISTANT_NAME}
              <span className="text-xs text-gray-400 ml-2">v{SYSTEM_CONFIG.SYSTEM_VERSION}</span>
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-400 hover:text-white text-sm">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* System status */}
          <div className="p-4">
            <StatusIndicator status={systemStatus} />
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col space-y-1">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>
          
          {/* Speech recognition feedback */}
          {micEnabled && recognizedText && (
            <div className="p-2 bg-gray-800 bg-opacity-50 m-4 rounded-lg">
              <p className="text-sm text-gray-300 italic">{recognizedText}</p>
            </div>
          )}
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-800 glass-panel">
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMicEnabled(!micEnabled)}
                className={micEnabled ? "text-nova-500" : "text-gray-400"}
              >
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Textarea
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={voiceEnabled ? "text-purple-500" : "text-gray-400"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <Button onClick={() => handleSubmit()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-96 border-l border-gray-800 overflow-y-auto p-4 hidden lg:block">
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="status">System Status</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-4">
              <div className="flex justify-center py-4">
                <AssistantAvatar 
                  size="lg" 
                  isListening={systemStatus.isListening}
                  isSpeaking={systemStatus.isSpeaking}
                  isThinking={systemStatus.isThinking}
                />
              </div>
              
              <Separator className="my-4" />
              
              <SystemDiagnostics />
              
              <div className="mt-4">
                <h3 className="text-xs font-bold text-gray-300 mb-2">
                  AUDIO STATUS
                </h3>
                <div className="flex justify-between">
                  <div className="w-5/12">
                    <p className="text-xs text-gray-400 mb-1">Input</p>
                    <VoiceVisualizer 
                      isActive={systemStatus.isListening} 
                      variant="input"
                    />
                  </div>
                  <div className="w-5/12">
                    <p className="text-xs text-gray-400 mb-1">Output</p>
                    <VoiceVisualizer 
                      isActive={systemStatus.isSpeaking} 
                      variant="output" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="modules">
              <div className="grid grid-cols-1 gap-3">
                {DEMO_MODULES.map((module) => (
                  <ModuleStatusCard key={module.id} module={module} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
