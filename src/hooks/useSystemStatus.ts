
import { useEffect, useState } from "react";
import { SystemStatus, Module } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useSystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: false,
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    lastUpdated: new Date(),
    activeModules: [],
    batteryLevel: 85,
    cpuUsage: 35,
    memoryUsage: 48
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        // Fetch system status
        const { data: statusData, error: statusError } = await supabase
          .from('system_status')
          .select('*')
          .limit(1)
          .single();
        
        if (statusError) throw statusError;

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*');
        
        if (modulesError) throw modulesError;

        // Filter active modules
        const activeModules = modulesData ? 
          modulesData.filter((module: any) => module.is_active).map((module: any) => ({
            id: module.id,
            name: module.name,
            isActive: module.is_active,
            status: module.status,
            description: module.description
          })) as Module[] : 
          [];
        
        setSystemStatus({
          isOnline: statusData ? statusData.is_online : false,
          isListening: false, // These are real-time states, set default values
          isSpeaking: false,
          isThinking: false,
          lastUpdated: statusData ? new Date(statusData.last_updated) : new Date(),
          activeModules,
          batteryLevel: 85, // Sample values for UI (could be expanded in the future)
          cpuUsage: 35,
          memoryUsage: 48
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching system status:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSystemStatus();
    
    // Set up a listener for real-time updates if needed in the future
    // const channel = supabase.channel('system-updates')...
    
  }, []);

  const updateListeningState = (isListening: boolean) => {
    setSystemStatus(prev => ({ ...prev, isListening }));
  };

  const updateSpeakingState = (isSpeaking: boolean) => {
    setSystemStatus(prev => ({ ...prev, isSpeaking }));
  };

  const updateThinkingState = (isThinking: boolean) => {
    setSystemStatus(prev => ({ ...prev, isThinking }));
  };

  return { 
    systemStatus, 
    isLoading, 
    error,
    updateListeningState,
    updateSpeakingState,
    updateThinkingState
  };
};
