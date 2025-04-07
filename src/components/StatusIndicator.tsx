
import React from "react";
import { cn } from "@/lib/utils";
import { SystemStatus } from "@/types";

interface StatusIndicatorProps {
  status: Partial<SystemStatus>;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center space-x-4 p-4 rounded-lg glass-panel",
        className
      )}
    >
      {/* Online status */}
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            status.isOnline ? "bg-green-500" : "bg-gray-500"
          )}
        ></div>
        <span className="text-xs text-gray-300">
          {status.isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Listening status */}
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            status.isListening ? "bg-nova-500 animate-pulse" : "bg-gray-500"
          )}
        ></div>
        <span className="text-xs text-gray-300">
          {status.isListening ? "Listening" : "Idle"}
        </span>
      </div>

      {/* Speaking status */}
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            status.isSpeaking ? "bg-purple-500 animate-pulse" : "bg-gray-500"
          )}
        ></div>
        <span className="text-xs text-gray-300">
          {status.isSpeaking ? "Speaking" : "Silent"}
        </span>
      </div>

      {/* System mode */}
      {status.activeModules && status.activeModules.length > 0 && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-300">
            {status.activeModules[0].name} Mode
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
