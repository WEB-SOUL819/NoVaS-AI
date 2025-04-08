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
import { Mic, MicOff, Send, VolumeX, Volume2, Menu, User, Settings as SettingsIcon, LogOut, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { useDevMode } from "@/contexts/DevModeContext";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getUserGreeting } from "@/utils/userGreeting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `${getUserGreeting(user)}. I'm ${SYSTEM_CONFIG.ASSISTANT_NAME}. How can I assist you today?`,
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const { isDevMode, userRole } = useDevMode();
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length > 0 && prev[0].id === "welcome") {
        return [
          {
            ...prev[0],
            content: `${getUserGreeting(user)}. I'm ${SYSTEM_CONFIG.ASSISTANT_NAME}. How can I assist you today?`,
          },
          ...prev.slice(1)
        ];
      }
      return prev;
    });
  }, [user]);
  
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
  
  const handleSubmit = async (text?: string) => {
    const messageText = text || inputMessage;
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    
    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "...",
      timestamp: new Date(),
      isProcessing: true,
    };
    
    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setInputMessage("");
    
    setSystemStatus(prev => ({ ...prev, isThinking: true }));
    
    try {
      const aiResponse = await processWithAI([...messages, userMessage]);
      
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
      
      setSystemStatus(prev => ({ ...prev, isThinking: false }));
      
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
      
      setSystemStatus(prev => ({ ...prev, isThinking: false, isSpeaking: false }));
      
      toast.error("Error processing message. Please try again.");
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("You have been signed out");
    } catch (error) {
      toast.error("Error signing out. Please try again.");
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col w-full overflow-hidden"
    >
      <header className="p-4 border-b border-gray-800 glass-panel sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AssistantAvatar size="sm" />
            <h1 className="text-xl font-bold text-white">
              {SYSTEM_CONFIG.ASSISTANT_NAME}
              <span className="text-xs text-gray-400 ml-2">v{SYSTEM_CONFIG.SYSTEM_VERSION}</span>
              {isDevMode && (
                <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  {userRole}
                </span>
              )}
            </h1>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link to="/dashboard" className="text-primary hover:text-white text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/automation" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Automation
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/automation" className="cursor-pointer">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Automation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <div className="p-4">
            <StatusIndicator status={systemStatus} />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col space-y-3 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MessageBubble message={message} />
                </motion.div>
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>
          
          {micEnabled && recognizedText && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gray-800 bg-opacity-50 mx-4 mb-4 rounded-lg"
            >
              <p className="text-sm text-gray-300 italic">{recognizedText}</p>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-4 border-t border-gray-800 glass-panel"
          >
            <div className="flex items-end space-x-2 max-w-3xl mx-auto">
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
                className="resize-none min-h-[60px]"
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
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-96 border-l border-gray-800 overflow-y-auto p-4 hidden lg:block"
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
