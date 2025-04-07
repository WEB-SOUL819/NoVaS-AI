
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isActive: boolean;
  variant?: "input" | "output";
  className?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  variant = "input",
  className,
}) => {
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(12).fill(0.1)
  );

  // Colors based on variant
  const barColor = variant === "input" ? "bg-nova-500" : "bg-purple-500";

  // Update bar heights for animation
  useEffect(() => {
    if (!isActive) {
      setBarHeights(Array(12).fill(0.1));
      return;
    }

    const interval = setInterval(() => {
      setBarHeights(
        Array(12)
          .fill(0)
          .map(() => (isActive ? 0.1 + Math.random() * 0.9 : 0.1))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div
      className={cn(
        "h-12 flex items-end justify-center space-x-0.5 px-1",
        className
      )}
    >
      {barHeights.map((height, index) => (
        <div
          key={index}
          className={cn("w-1 rounded-t-full", barColor)}
          style={{
            height: `${height * 100}%`,
            transition: "height 100ms ease",
          }}
        ></div>
      ))}
    </div>
  );
};

export default VoiceVisualizer;
