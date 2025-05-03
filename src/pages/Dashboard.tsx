
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
import { useIsMobile } from "@/hooks/use-mobile";
import AIModeSelector, { AIMode } from "@/components/AIModeSelector";

// Import our new components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChatInterface from "@/components/dashboard/ChatInterface";
import SystemPanel from "@/components/dashboard/SystemPanel";
import WeatherPanel from "@/components/weather/WeatherPanel";
import { getUserLocation, getWeatherByCoordinates } from "@/utils/weatherService";

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
  const isMobile = useIsMobile();
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
  const [showSystemPanel, setShowSystemPanel] = useState(!isMobile);
  const [currentAIMode, setCurrentAIMode] = useState<AIMode>('assistant');
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  
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

  // Set system panel visibility based on screen size
  useEffect(() => {
    setShowSystemPanel(!isMobile);
  }, [isMobile]);

  // Handle mode-specific actions when the AI mode changes
  useEffect(() => {
    if (currentAIMode === 'weather') {
      setShowWeatherPanel(true);
      
      // Get weather for user's location
      const getLocationWeather = async () => {
        const location = await getUserLocation();
        if (location) {
          const weather = await getWeatherByCoordinates(location);
          if (weather) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `Current weather in ${weather.location}: ${weather.temperature}°C, ${weather.description}. Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} m/s.`,
                timestamp: new Date(),
              }
            ]);
          }
        }
      };
      
      getLocationWeather();
    } else {
      setShowWeatherPanel(false);
    }
  }, [currentAIMode]);

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
      analyst: "Analyst mode ready. I'll help with data analysis and intelligence gathering.",
      weather: "Weather mode activated. I can provide weather forecasts and information for any location.",
      jarvis: "JARVIS mode activated. I'll respond with enhanced capabilities and a Tony Stark-inspired personality."
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

  const toggleSystemPanel = () => {
    setShowSystemPanel(prev => !prev);
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
        onToggleSystemPanel={toggleSystemPanel}
        showSystemPanelButton={isMobile}
        isMobile={isMobile}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <div className={`p-4 flex ${isMobile ? "flex-col gap-2" : "justify-between"} items-center`}>
            <StatusIndicator status={systemStatus} />
            <AIModeSelector currentMode={currentAIMode} onModeChange={handleAIModeChange} />
          </div>
          
          {showWeatherPanel && currentAIMode === 'weather' ? (
            <WeatherPanel isMobile={isMobile} setMessages={setMessages} />
          ) : (
            <ChatInterface 
              messages={messages}
              setMessages={setMessages}
              systemStatus={systemStatus}
              setSystemStatus={setSystemStatus}
              user={user}
              isMobile={isMobile}
              currentMode={currentAIMode}
            />
          )}
        </motion.div>
        
        {/* System Panel - conditionally rendered based on showSystemPanel state */}
        {showSystemPanel && (
          <SystemPanel 
            systemStatus={systemStatus}
            modules={DEMO_MODULES}
            isMobile={isMobile}
            onClose={isMobile ? () => setShowSystemPanel(false) : undefined}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
