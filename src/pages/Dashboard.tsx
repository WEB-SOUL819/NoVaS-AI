
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useDevMode } from "@/contexts/DevModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import StatusIndicator from "@/components/StatusIndicator";
import { SYSTEM_CONFIG } from "@/config/env";
import { Message, Module, SystemStatus } from "@/types";
import { getUserGreeting } from "@/utils/userGreeting";
import AIModeSelector, { AIMode } from "@/components/AIModeSelector";

// Import our new components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChatInterface from "@/components/dashboard/ChatInterface";
import SystemPanel from "@/components/dashboard/SystemPanel";

// Demo modules for the system panel
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
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `${getUserGreeting(user)}. I'm ${SYSTEM_CONFIG.ASSISTANT_NAME}, an advanced AI assistant. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: true,
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    lastUpdated: new Date(),
    activeModules: DEMO_MODULES.filter(m => m.isActive),
  });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentAIMode, setCurrentAIMode] = useState<AIMode>('assistant');
  
  const { isDevMode, userRole } = useDevMode();
  
  useEffect(() => {
    setMessages(prev => {
      if (prev.length > 0 && prev[0].id === "welcome") {
        return [
          {
            ...prev[0],
            content: `${getUserGreeting(user)}. I'm ${SYSTEM_CONFIG.ASSISTANT_NAME}, an advanced AI assistant. How can I assist you today?`,
          },
          ...prev.slice(1)
        ];
      }
      return prev;
    });
  }, [user]);

  // Handle AI mode change
  const handleAIModeChange = (mode: AIMode) => {
    setCurrentAIMode(mode);
    
    // Add a system message to indicate the mode change
    const modeMessages: Record<AIMode, string> = {
      assistant: "I'm now in Assistant mode. How can I help you?",
      oracle: "Oracle mode activated. I'll focus on providing knowledge and predictions.",
      alfred: "Alfred mode at your service. I'll prioritize task management and personal assistance.",
      hacker: "Hacker mode engaged. I'll focus on ethical hacking and security topics.",
      pentester: "Pentester mode activated. Advanced security testing assistance is now available.",
      analyst: "Analyst mode ready. I'll help with data analysis and intelligence gathering."
    };
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "system",
        content: `Mode changed to ${mode}`,
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: modeMessages[mode],
        timestamp: new Date(),
      }
    ]);
    
    toast.success(`AI mode changed to ${mode}`);
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
      <DashboardHeader 
        isDevMode={isDevMode} 
        userRole={userRole} 
        onSignOut={handleSignOut} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <div className="p-4 flex justify-between items-center">
            <StatusIndicator status={systemStatus} />
            <AIModeSelector currentMode={currentAIMode} onModeChange={handleAIModeChange} />
          </div>
          
          <ChatInterface 
            messages={messages}
            setMessages={setMessages}
            systemStatus={systemStatus}
            setSystemStatus={setSystemStatus}
            user={user}
          />
        </motion.div>
        
        <SystemPanel 
          systemStatus={systemStatus}
          modules={DEMO_MODULES}
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;
