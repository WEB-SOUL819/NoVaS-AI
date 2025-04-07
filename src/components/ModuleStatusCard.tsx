
import React from "react";
import { cn } from "@/lib/utils";
import { Module } from "@/types";

interface ModuleStatusCardProps {
  module: Module;
  className?: string;
}

const ModuleStatusCard: React.FC<ModuleStatusCardProps> = ({
  module,
  className,
}) => {
  // Status-based styling
  const getStatusColor = (status: Module["status"]) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "limited":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg glass-panel border border-gray-800",
        module.isActive && "border-nova-600/40",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">{module.name}</h3>
        <div className="flex items-center">
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              getStatusColor(module.status)
            )}
          ></div>
          <span className="text-xs capitalize text-gray-400">
            {module.status}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400">{module.description}</p>
    </div>
  );
};

export default ModuleStatusCard;
