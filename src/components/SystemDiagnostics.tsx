
import React from "react";
import { cn } from "@/lib/utils";

interface SystemDiagnosticsProps {
  cpuUsage?: number;
  memoryUsage?: number;
  batteryLevel?: number;
  networkStrength?: number;
  className?: string;
}

const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({
  cpuUsage = 35,
  memoryUsage = 48,
  batteryLevel = 85,
  networkStrength = 92,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-lg glass-panel flex flex-col space-y-4",
        className
      )}
    >
      <h3 className="text-xs font-bold text-gray-300 mb-2">
        SYSTEM DIAGNOSTICS
      </h3>

      {/* CPU Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">CPU</span>
          <span className="text-xs text-gray-300">{cpuUsage}%</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              cpuUsage > 80
                ? "bg-red-500"
                : cpuUsage > 60
                ? "bg-yellow-500"
                : "bg-nova-500"
            )}
            style={{ width: `${cpuUsage}%` }}
          ></div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">MEMORY</span>
          <span className="text-xs text-gray-300">{memoryUsage}%</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              memoryUsage > 80
                ? "bg-red-500"
                : memoryUsage > 60
                ? "bg-yellow-500"
                : "bg-nova-500"
            )}
            style={{ width: `${memoryUsage}%` }}
          ></div>
        </div>
      </div>

      {/* Battery Level */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">BATTERY</span>
          <span className="text-xs text-gray-300">{batteryLevel}%</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              batteryLevel < 20
                ? "bg-red-500"
                : batteryLevel < 40
                ? "bg-yellow-500"
                : "bg-green-500"
            )}
            style={{ width: `${batteryLevel}%` }}
          ></div>
        </div>
      </div>

      {/* Network Strength */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">NETWORK</span>
          <span className="text-xs text-gray-300">{networkStrength}%</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              networkStrength < 50
                ? "bg-red-500"
                : networkStrength < 70
                ? "bg-yellow-500"
                : "bg-green-500"
            )}
            style={{ width: `${networkStrength}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
