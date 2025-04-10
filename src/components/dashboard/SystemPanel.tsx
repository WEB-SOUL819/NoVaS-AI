
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AssistantAvatar from "@/components/AssistantAvatar";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import SystemDiagnostics from "@/components/SystemDiagnostics";
import ModuleStatusCard from "@/components/ModuleStatusCard";
import { Module } from "@/types";
import { motion } from "framer-motion";

interface SystemPanelProps {
  systemStatus: {
    isListening: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
    activeModules?: Module[];
  };
  modules: Module[];
}

const SystemPanel: React.FC<SystemPanelProps> = ({ systemStatus, modules }) => {
  return (
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
            {modules.map((module) => (
              <ModuleStatusCard key={module.id} module={module} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SystemPanel;
