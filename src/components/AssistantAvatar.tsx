
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AssistantAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const AssistantAvatar: React.FC<AssistantAvatarProps> = ({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  size = "md",
  className,
}) => {
  const [waveValues, setWaveValues] = useState<number[]>(Array(6).fill(0.1));

  // Update wave values for animation
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setWaveValues(
          Array(6)
            .fill(0)
            .map(() => 0.1 + Math.random() * 0.9)
        );
      }, 100);
      return () => clearInterval(interval);
    }
    setWaveValues(Array(6).fill(0.1));
  }, [isSpeaking]);

  // Size classes
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden",
        sizeClasses[size],
        isListening && "ring-2 ring-nova-500 animate-pulse-opacity",
        isThinking && "ring-2 ring-purple-500 animate-pulse-opacity",
        className
      )}
    >
      {/* Circular gradient background */}
      <div className="absolute inset-0 nova-gradient opacity-80"></div>

      {/* Hexagonal mask */}
      <div className="absolute inset-0 hexagon bg-card opacity-90"></div>

      {/* Rotating circle effect */}
      <div className="absolute inset-1 rounded-full border border-nova-400 opacity-30 animate-rotate-circle"></div>

      {/* Inner glow */}
      <div className="absolute inset-3 rounded-full bg-nova-600 blur-md opacity-40"></div>

      {/* Core */}
      <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
        <span className="text-white font-bold text-xs">N</span>
      </div>

      {/* Voice visualizer - only show when speaking */}
      {isSpeaking && (
        <div className="absolute bottom-2 left-0 right-0 flex items-end justify-center h-4 px-1">
          {waveValues.map((value, index) => (
            <div
              key={index}
              className="visualizer-bar h-4"
              style={{
                transform: `scaleY(${value})`,
                animationDelay: `${index * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssistantAvatar;
